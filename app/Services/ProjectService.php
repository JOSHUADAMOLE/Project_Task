<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Support\Facades\DB;

class ProjectService
{
    public function __construct(public Project $project) {}

    public function updateUserAccess(array $userIds): bool
    {
        // Remove duplicates just in case
        $userIds = array_unique($userIds);

        // Delete old access
        DB::table('project_user_access')
            ->where('project_id', $this->project->id)
            ->delete();

        // Insert new access
        return DB::table('project_user_access')
            ->insert(
                collect($userIds)
                    ->map(fn ($id) => ['user_id' => $id, 'project_id' => $this->project->id])
                    ->toArray()
            );
    }
}
