<?php

namespace App\Http\Resources\Project;

use App\Services\PermissionService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'favorite' => $this->favorite,
            
            // ✅ Safe null check
            'client_company' => $this->clientCompany
                ? $this->clientCompany->only(['id', 'name'])
                : null,

            'users_with_access' => \App\Services\PermissionService::usersWithAccessToProject($this),
            'all_tasks_count' => $this->all_tasks_count,
            'completed_tasks_count' => $this->completed_tasks_count,
            'overdue_tasks_count' => $this->overdue_tasks_count,
        ];
    }
}
