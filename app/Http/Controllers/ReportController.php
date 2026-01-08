<?php

namespace App\Http\Controllers;

use App\Enums\PricingType;
use App\Models\ClientCompany;
use App\Models\Project;
use App\Models\User;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function loggedTimeSum(Request $request): Response
    {
        Gate::allowIf(fn (User $user) => $user->can('view logged time sum report'));

        $completed = $request->get('completed', 'true') === 'true';

        return Inertia::render('Reports/LoggedTimeSum', [
            'projects' => DB::table('time_logs')
                ->join('tasks', 'tasks.id', '=', 'time_logs.task_id')
                ->join('projects', 'projects.id', '=', 'tasks.project_id')
                ->join('users', 'time_logs.user_id', '=', 'users.id')
                ->when($request->projects, fn ($query) => $query->whereIn('projects.id', $request->projects))
                ->when($request->users, fn ($query) => $query->whereIn('time_logs.user_id', $request->users))
                ->when($request->dateRange,
                    function ($query) use ($request) {
                        $query->whereBetween('time_logs.created_at', [
                            Carbon::parse($request->dateRange[0])->startOfDay(),
                            Carbon::parse($request->dateRange[1])->endOfDay(),
                        ]);
                    },
                    fn ($query) => $query->where('time_logs.created_at', '>', now()->subWeek())
                )
                ->{$completed ? 'whereNotNull' : 'whereNull'}('tasks.completed_at')
                ->where('billable', $request->get('billable', 'true') === 'true')
                ->groupBy(['tasks.project_id'])
                ->selectRaw('
                    MAX(projects.id) AS project_id, MAX(projects.name) AS project_name,
                    MAX(projects.rate) AS project_rate, MAX(projects.client_company_id) AS client_company_id,
                    MAX(users.id) AS user_id, MAX(users.name) AS user_name, MAX(users.rate) AS user_rate,
                    SUM(time_logs.minutes) / 60 AS total_hours
                ')
                ->orderBy('project_name')
                ->get()
                ->groupBy('project_id'),
            'clientCompanies' => ClientCompany::with('currency')->get(['id', 'name', 'currency_id']),
            'dropdowns' => [
                'projects' => Project::dropdownValues(),
                'users' => User::userDropdownValues(['client']),
            ],
        ]);
    }

    public function dailyLoggedTime(Request $request): Response
    {
        Gate::allowIf(fn (User $user) => $user->can('view daily logged time report'));

        $completed = $request->get('completed', 'true') === 'true';

        $items = DB::table('time_logs')
            ->join('tasks', 'tasks.id', '=', 'time_logs.task_id')
            ->join('projects', 'projects.id', '=', 'tasks.project_id')
            ->join('users', 'time_logs.user_id', '=', 'users.id')
            ->when($request->projects, fn ($query) => $query->whereIn('projects.id', $request->projects))
            ->when($request->users, fn ($query) => $query->whereIn('time_logs.user_id', $request->users))
            ->when($request->dateRange,
                function ($query) use ($request) {
                    $query->whereBetween('time_logs.created_at', [
                        Carbon::parse($request->dateRange[0])->startOfDay(),
                        Carbon::parse($request->dateRange[1])->endOfDay(),
                    ]);
                },
                fn ($query) => $query->where('time_logs.created_at', '>', now()->subWeek())
            )
            ->{$completed ? 'whereNotNull' : 'whereNull'}('tasks.completed_at')
            ->where('billable', $request->get('billable', 'true') === 'true')
            ->groupBy(['time_logs.user_id', 'date'])
            ->selectRaw('
                MAX(projects.id) AS project_id, MAX(projects.name) AS project_name,
                MAX(users.id) AS user_id, MAX(users.name) AS user_name,
                SUM(time_logs.minutes) / 60 AS total_hours, DATE_FORMAT(time_logs.created_at, "%e. %b %Y") AS date
            ')
            ->orderBy('date')
            ->get();

        return Inertia::render('Reports/DailyLoggedTime', [
            'items' => $items
                ->groupBy('date')
                ->map->keyBy('user_id'),
            'users' => $items
                ->unique('user_id')
                ->mapInto(Collection::class)
                ->map->only('user_name', 'user_id')
                ->keyBy('user_id')
                ->sortBy('user_name'),
            'dropdowns' => [
                'projects' => Project::dropdownValues(),
                'users' => User::userDropdownValues(),
            ],
        ]);
    }

    public function fixedPriceSum(Request $request): Response
    {
        Gate::allowIf(fn (User $user) => $user->can('view fixed price sum report'));

        $completed = $request->get('completed', 'true') === 'true';

        return Inertia::render('Reports/FixedPriceSum', [
            'users' => DB::table('tasks')
                ->join('projects', 'projects.id', '=', 'tasks.project_id')
                ->join('users', 'tasks.assigned_to_user_id', '=', 'users.id')
                ->when($request->projects, fn ($query) => $query->whereIn('projects.id', $request->projects))
                ->when($request->users, fn ($query) => $query->whereIn('tasks.assigned_to_user_id', $request->users))
                ->when($request->dateRange,
                    function ($query) use ($request, $completed) {
                        $query->whereBetween('tasks.'.($completed ? 'completed_at' : 'created_at'), [
                            Carbon::parse($request->dateRange[0])->startOfDay(),
                            Carbon::parse($request->dateRange[1])->endOfDay(),
                        ]);
                    },
                    fn ($query) => $query->where('tasks.'.($completed ? 'completed_at' : 'created_at'), '>', now()->subWeek())
                )
                ->{$completed ? 'whereNotNull' : 'whereNull'}('tasks.completed_at')
                ->where('tasks.pricing_type', PricingType::FIXED->value)
                ->where('tasks.billable', $request->get('billable', 'true') === 'true')
                ->whereNotNull('tasks.assigned_to_user_id')
                ->groupBy(['tasks.assigned_to_user_id'])
                ->selectRaw('
                    MAX(users.id) AS user_id,
                    MAX(users.name) AS user_name,
                    SUM(tasks.fixed_price) AS total_fixed_price,
                    COUNT(tasks.id) AS total_tasks
                ')
                ->orderBy('user_name')
                ->get(),
            'clientCompanies' => ClientCompany::with('currency')->get(['id', 'name', 'currency_id']),
            'dropdowns' => [
                'projects' => Project::dropdownValues(),
                'users' => User::userDropdownValues(['client']),
            ],
        ]);
    }

    /**
     * ✅ WORK STATISTICS + PERFORMANCE REPORT
     */
    public function workStatistics()
    {
        $user = auth()->user();

        if ($user->hasRole('admin')) {
            $projects = Project::with(['tasks:id,name,project_id,completed_at'])->get(['id','name']);
        } elseif ($user->hasRole('client')) {
            $projects = Project::whereHas('tasks.subscribedUsers', fn($q) => $q->where('user_id', $user->id))
                ->with(['tasks' => fn($q) => $q->whereHas('subscribedUsers', fn($sub) => $sub->where('user_id', $user->id))
                    ->select('id','name','project_id','completed_at')])
                ->get(['id','name']);
        } else {
            $projects = Project::whereHas('tasks', fn($q) => $q->where('assigned_to_user_id', $user->id))
                ->with(['tasks' => fn($q) => $q->where('assigned_to_user_id', $user->id)
                    ->select('id','name','project_id','completed_at')])
                ->get(['id','name']);
        }

        $chartData = $projects->flatMap(fn($project) =>
            $project->tasks->map(fn($task) => [
                'project' => $project->name,
                'task' => $task->name,
                'status' => $task->completed_at ? 'Completed' : 'Incomplete',
            ])
        );

        $completedTasks = $chartData->where('status', 'Completed')->count();
        $incompleteTasks = $chartData->where('status', 'Incomplete')->count();

        /* ===========================
           ✅ PERFORMANCE CALCULATION
        ============================ */

        $teamPerformance = Team::with('users.tasks')->get()->map(function ($team) {
            $assigned = 0;
            $completed = 0;

            foreach ($team->users as $user) {
                $assigned += $user->tasks->count();
                $completed += $user->tasks->whereNotNull('completed_at')->count();
            }

            $rate = $assigned > 0 ? round(($completed / $assigned) * 100, 2) : 0;

            return [
                'team' => $team->name,
                'assigned_tasks' => $assigned,
                'completed_tasks' => $completed,
                'completion_rate' => $rate,
                'status' => $this->performanceLabel($rate),
            ];
        });

        // -----------------------------
        // INDIVIDUAL PERFORMANCE
        // -----------------------------
        $individualPerformance = User::with(['tasks', 'teams'])
            ->where(function($q) {
                // Users who are Team Leaders
                $q->whereHas('roles', fn($r) => $r->where('name', 'Team Leader'))
                // OR users who belong to a team (team members)
                ->orWhereHas('teams');
            })
            ->get()
            ->map(function ($user) {
                $assigned = $user->tasks->count();
                $completed = $user->tasks->whereNotNull('completed_at')->count();

                $completionRate = $assigned > 0 ? round(($completed / $assigned) * 100, 2) : 0;

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'assigned_tasks' => $assigned,
                    'completed_tasks' => $completed,
                    'completion_rate' => $completionRate,
                    'status' => $this->performanceLabel($completionRate),
                ];
            })
            ->sortByDesc('completion_rate')
            ->values();


        return Inertia::render('Reports/WorkStatistics', [
            'statistics' => [
                'completed_tasks' => $completedTasks,
                'incomplete_tasks' => $incompleteTasks,
                'total_projects' => $projects->count(),
            ],
            'chartData' => $chartData,
            'teamPerformance' => $teamPerformance,
            'individualPerformance' => $individualPerformance,
        ]);
    }

    /**
     * Performance label
     */
    private function performanceLabel(float $rate): string
    {
        if ($rate >= 80) return 'Good';
        if ($rate >= 50) return 'Average';
        return 'Poor';
    }
}
