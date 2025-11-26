<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'job_title' => $this->job_title,
            'avatar' => $this->avatar,
            'roles' => $this->roles->map(fn($role) => [
                'id' => $role->id,
                'name' => (string) $role->name, // force string
            ])->toArray(),
            'teams' => $this->teams->map(fn($team) => [
                'id' => $team->id,
                'name' => (string) $team->name, // force string
            ])->toArray(),
        ];
    }
}
