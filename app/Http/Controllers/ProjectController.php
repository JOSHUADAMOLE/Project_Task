<?php

namespace App\Http\Controllers;

use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\Project\ProjectResource;
use App\Models\ClientCompany;
use App\Models\Project;
use App\Models\User;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function __construct()
    {
        $this->authorizeResource(Project::class, 'project');
    }

    public function index(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Projects/Index', [
            'items' => ProjectResource::collection(
                Project::searchByQueryString()
                    ->when($user->isNotAdmin(), function ($query) use ($user) {
                        if ($user->hasRole('client')) {
                            // Show projects belonging to this client's companies
                            $query->whereIn('client_company_id', $user->clientCompanies()->pluck('client_company_id'));
                        } else {
                            // Show projects assigned to the user
                            $query->whereHas('users', fn($q) => $q->where('id', $user->id));
                        }
                    })
                    ->when($request->has('archived'), fn ($query) => $query->onlyArchived())
                    ->with([
                        'clientCompany:id,name',
                        'users:id,name,avatar',
                    ])
                    ->withCount([
                        'tasks AS all_tasks_count',
                        'tasks AS completed_tasks_count' => fn($query) => $query->whereNotNull('completed_at'),
                        'tasks AS overdue_tasks_count' => fn($query) => $query->whereNull('completed_at')->whereDate('due_on', '<', now()),
                    ])
                    ->withExists('favoritedByAuthUser AS favorite')
                    ->orderBy('favorite', 'desc')
                    ->orderBy('name', 'asc')
                    ->get()
            ),
        ]);
    }


    public function create()
    {
        return Inertia::render('Projects/Create', [
            'dropdowns' => [
                'companies' => ClientCompany::dropdownValues(),
                'users' => User::role('team leader')
                    ->orderBy('name')
                    ->get(['id', 'name'])
                    ->map(fn ($u) => [
                        'value' => (string) $u->id,
                        'label' => $u->name,
                    ])
                    ->toArray(),
            ],
        ]);
    }

    public function store(StoreProjectRequest $request)
    {
        $data = $request->validated();

        // ✅ Ensure company is selected
        if (empty($data['client_company_id'])) {
            return back()->withErrors(['client_company_id' => 'Company is required.']);
        }

        $project = Project::create($data);

        // ✅ Assign team leader to project_user
        if (!empty($data['team_leader_id'])) {
            $project->users()->attach($data['team_leader_id']);
        }

        // Default task groups
        $project->taskGroups()->createMany([
            ['name' => 'To do'],
            ['name' => 'In progress'],
            ['name' => 'Completed'],
        ]);

        return redirect()
            ->route('projects.index')
            ->success('Project created', 'A new project was successfully created.');
    }

    public function edit(Project $project)
    {
        return Inertia::render('Projects/Edit', [
            'item' => $project,
            'dropdowns' => [
                'companies' => ClientCompany::dropdownValues(),
                'users' => User::role('team leader')
                    ->orderBy('name')
                    ->get(['id', 'name'])
                    ->map(fn($i) => ['value' => (string) $i->id, 'label' => $i->name])
                    ->toArray(),
            ],
        ]);
    }


    public function update(UpdateProjectRequest $request, Project $project)
    {
        $data = $request->validated();

        // ✅ Ensure company is selected
        if (empty($data['client_company_id'])) {
            return back()->withErrors(['client_company_id' => 'Company is required.']);
        }

        $project->update($data);

        if (!empty($data['team_leader_id'])) {
            // ✅ keep only one team leader
            $project->users()->sync([$data['team_leader_id']]);
        }

        return redirect()
            ->route('projects.index')
            ->success('Project updated', 'The project was successfully updated.');
    }

    public function destroy(Project $project)
    {
        $project->archive();

        return redirect()
            ->back()
            ->success('Project archived', 'The project was successfully archived.');
    }

    public function restore(int $projectId)
    {
        $project = Project::withArchived()->findOrFail($projectId);

        $this->authorize('restore', $project);

        $project->unArchive();

        return redirect()
            ->back()
            ->success('Project restored', 'The restoring of the project was completed successfully.');
    }

    public function favoriteToggle(Project $project)
    {
        request()->user()->toggleFavorite($project);

        return redirect()->back();
    }

    public function userAccess(Request $request, Project $project)
    {
        $this->authorize('editUserAccess', $project);

        // Merge regular users + client users into a single array
        $userIds = array_merge(
            $request->get('users', []),
            $request->get('clients', [])
        );

        // Remove duplicates just in case
        $userIds = array_unique($userIds);

        // Update project access
        (new ProjectService($project))->updateUserAccess($userIds);

        return redirect()->back()
            ->success('Access updated', 'User and client access updated.');
    }

}
