<?php

namespace App\Observers;

use App\Models\Project;

class ProjectObserver
{
    /**
     * Handle the Project "created" event.
     */
    public function created(Project $project): void
    {
        $user = auth()->user();

        $project->activities()->create([
            'project_id' => $project->id,
            'user_id' => optional($user)->id, // null-safe
            'title' => 'New project',
            'subtitle' => "\"{$project->name}\" was created" . ($user ? " by {$user->name}" : ""),
        ]);
    }

    /**
     * Handle the Project "updated" event.
     */
    public function updated(Project $project): void
    {
        $user = auth()->user();

        if ($project->isDirty(['name'])) {
            $project->activities()->create([
                'project_id' => $project->id,
                'user_id' => optional($user)->id,
                'title' => 'Project name was changed',
                'subtitle' => "from \"{$project->getOriginal('name')}\" to \"{$project->name}\"" . ($user ? " by {$user->name}" : ""),
            ]);
        }
    }

    /**
     * Handle the Project "archived" event.
     */
    public function archived(Project $project): void
    {
        $user = auth()->user();

        $project->activities()->create([
            'project_id' => $project->id,
            'user_id' => optional($user)->id,
            'title' => 'Project was archived',
            'subtitle' => "\"{$project->name}\" was archived" . ($user ? " by {$user->name}" : ""),
        ]);
    }

    /**
     * Handle the Project "unArchived" event.
     */
    public function unArchived(Project $project): void
    {
        $user = auth()->user();

        $project->activities()->create([
            'project_id' => $project->id,
            'user_id' => optional($user)->id,
            'title' => 'Project was unarchived',
            'subtitle' => "\"{$project->name}\" was unarchived" . ($user ? " by {$user->name}" : ""),
        ]);
    }
}
