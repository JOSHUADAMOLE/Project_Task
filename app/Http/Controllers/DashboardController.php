<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Project;
use App\Models\Task;
use App\Services\PermissionService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();

        // Default project access (for admin/internal users)
        $projectIds = PermissionService::projectsThatUserCanAccess($user)->pluck('id');

        // If client, include projects by company association
        if ($user->hasRole('client')) {
            $companyProjectIds = Project::whereIn('client_company_id', $user->clientCompanies->pluck('id'))->pluck('id');
            $projectIds = $projectIds->merge($companyProjectIds)->unique();
        }

        return Inertia::render('Dashboard/Index', [
            'projects' => Project::whereIn('id', $projectIds)
                ->with(['clientCompany:id,name'])
                ->withCount([
                    'tasks AS all_tasks_count',
                    'tasks AS completed_tasks_count' => fn($query) => $query->whereNotNull('completed_at'),
                    'tasks AS overdue_tasks_count' => fn($query) => $query
                        ->whereNull('completed_at')
                        ->whereDate('due_on', '<', now()),
                ])
                ->withExists('favoritedByAuthUser AS favorite')
                ->orderBy('favorite', 'desc')
                ->orderBy('name', 'asc')
                ->get(['id', 'name', 'client_company_id']),

            'overdueTasks' => Task::whereIn('project_id', $projectIds)
                ->whereNull('completed_at')
                ->whereDate('due_on', '<', now())
                ->with('project:id,name')
                ->with('taskGroup:id,name')
                ->orderBy('due_on')
                ->get(['id', 'name', 'due_on', 'group_id', 'project_id']),

            'recentlyAssignedTasks' => Task::whereIn('project_id', $projectIds)
                ->whereNull('completed_at')
                ->whereNotNull('assigned_at')
                ->where('assigned_to_user_id', $user->id)
                ->with('project:id,name')
                ->with('taskGroup:id,name')
                ->orderBy('assigned_at')
                ->limit(10)
                ->get(['id', 'name', 'assigned_at', 'group_id', 'project_id']),

            'recentComments' => Comment::query()
                ->whereHas('task', function ($query) use ($projectIds, $user) {
                    $query->whereIn('project_id', $projectIds)
                        ->where('assigned_to_user_id', $user->id);
                })
                ->with([
                    'task:id,name,project_id',
                    'task.project:id,name',
                    'user:id,name',
                ])
                ->latest()
                ->get(),
        ]);
    }
}
