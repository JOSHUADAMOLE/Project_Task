<?php

namespace App\Http\Controllers;

use App\Actions\Task\CreateTask;
use App\Actions\Task\UpdateTask;
use App\Events\Task\TaskDeleted;
use App\Events\Task\TaskGroupChanged;
use App\Events\Task\TaskOrderChanged;
use App\Events\Task\TaskRestored;
use App\Events\Task\TaskUpdated;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use App\Models\Project;
use App\Models\Task;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request, Project $project, ?Task $task = null): Response
    {
        $this->authorize('viewAny', [Task::class, $project]);

        $user = $request->user();

        // -----------------------------
        // All task groups in this project
        // -----------------------------
        $groups = $project->taskGroups()->get();

        // -----------------------------
        // Assignable Users: team leader's members
        // -----------------------------
        $assignableUsers = collect();
        if ($user->hasRole('Team Leader')) {
            $assignableUsers = $user->teamMembers()->map(fn($member) => [
                'id' => $member->id,
                'name' => $member->name,
            ]);
        }

        // -----------------------------
        // Subscribers: admins and clients
        // -----------------------------
        $subscribers = PermissionService::usersWithAccessToProject($project)
            ->filter(function ($u) {
                $role = is_array($u) ? ($u['role'] ?? null) : ($u->role ?? null);
                return in_array($role, ['admin', 'client']);
            })
            ->map(function ($u) {
                return [
                    'id' => is_array($u) ? $u['id'] : $u->id,
                    'name' => is_array($u) ? $u['name'] : $u->name,
                ];
            })
            ->values();

        // -----------------------------
        // Grouped tasks with default relations
        // -----------------------------
        $groupedTasks = $project
            ->taskGroups()
            ->with(['tasks' => function ($q) use ($request) {
                $q->withDefault()
                    ->when(!$request->has('status'), fn($q) => $q->whereNull('completed_at'));
            }])
            ->get()
            ->mapWithKeys(fn($group) => [$group->id => $group->tasks]);

        // -----------------------------
        // Opened task for editing
        // -----------------------------
        $openedTask = null;
        if ($task) {
            $openedTask = $task
                ->load($task->defaultWith) // load all default relations
                ->load(['createdByUser:id,name']); // ensure createdByUser has id & name
        }

        // -----------------------------
        // Return to Inertia
        // -----------------------------
        return Inertia::render('Projects/Tasks/Index', [
            'project' => $project,
            'taskGroups' => $groups,
            'groupedTasks' => $groupedTasks,
            'assignableUsers' => $assignableUsers,
            'subscribers' => $subscribers,
            'openedTask' => $openedTask,
            'authUser' => $request->user()->load('roles'),
            'currency' => null,
        ]);
    }


    public function store(StoreTaskRequest $request, Project $project): RedirectResponse
    {
        $this->authorize('create', [Task::class, $project]);
        (new CreateTask)->create($project, $request->validated());

        return redirect()->route('projects.tasks', $project)
            ->success('Task added', 'A new task was successfully added.');
    }

    public function update(UpdateTaskRequest $request, Project $project, Task $task): JsonResponse
    {
        $this->authorize('update', [$task, $project]);
        (new UpdateTask)->update($task, $request->validated());

        return response()->json();
    }

    public function reorder(Request $request, Project $project): JsonResponse
    {
        $this->authorize('reorder', [Task::class, $project]);
        Task::setNewOrder($request->ids);

        TaskOrderChanged::dispatch(
            $project->id,
            $request->group_id,
            $request->from_index,
            $request->to_index,
        );

        return response()->json();
    }

    public function move(Request $request, Project $project): JsonResponse
    {
        $this->authorize('reorder', [Task::class, $project]);
        Task::setNewOrder($request->ids);
        Task::whereIn('id', $request->ids)->update(['group_id' => $request->to_group_id]);

        TaskGroupChanged::dispatch(
            $project->id,
            $request->from_group_id,
            $request->to_group_id,
            $request->from_index,
            $request->to_index,
        );

        return response()->json();
    }

    public function complete(Request $request, Project $project, Task $task): JsonResponse
    {
        $this->authorize('complete', [Task::class, $project]);
        $task->update(['completed_at' => ($request->completed === true) ? now() : null]);
        TaskUpdated::dispatch($task, 'completed_at');

        return response()->json();
    }

    public function destroy(Project $project, Task $task): RedirectResponse
    {
        $this->authorize('archive task', [$task, $project]);
        $task->archive();
        TaskDeleted::dispatch($task->id, $task->project_id);

        return redirect()->back()->success('Task archived', 'The task was successfully archived.');
    }

    public function restore(Project $project, Task $task): RedirectResponse
    {
        $this->authorize('restore', [$task, $project]);
        $task->unArchive();
        TaskRestored::dispatch($task);

        return redirect()->back()->success('Task restored', 'The restoring of the Task was completed successfully.');
    }
}
