<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class DropdownValuesController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $dropdowns = collect();
        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | USERS (admins, staff, etc.)
        |--------------------------------------------------------------------------
        */
        if ($request->has('users')) {
            $dropdowns->put('users', User::userDropdownValues());
        }

        /*
        |--------------------------------------------------------------------------
        | CLIENTS
        |--------------------------------------------------------------------------
        */
        if ($request->has('clients')) {
            $dropdowns->put('clients', User::clientDropdownValues());
        }

        /*
        |--------------------------------------------------------------------------
        | PROJECT USERS (for mentions)
        |--------------------------------------------------------------------------
        */
        if ($request->has('mentionProjectUsers')) {
            $project = Project::findOrFail($request->projectId);

            $usersWithAccess = PermissionService::usersWithAccessToProject($project);

            $dropdowns->put(
                'mentionProjectUsers',
                $usersWithAccess->pluck('name')->values()
            );
        }

        /*
        |--------------------------------------------------------------------------
        | ASSIGNEES (TASK ASSIGNMENT)
        |--------------------------------------------------------------------------
        | Team Leader  → only their team members
        | Admin        → all users
        |--------------------------------------------------------------------------
        */
        if ($request->has('assignees')) {
            // Not logged in
            if (! $user) {
                $dropdowns->put('assignees', []);
            }

            // Team Leader → ONLY team members
            elseif ($user->hasRole('team leader')) {
                $assignees = $user->teamMembers()
                    ->map(fn ($member) => [
                        'value' => (string) $member->id,
                        'label' => $member->name,
                    ])
                    ->values();

                $dropdowns->put('assignees', $assignees);
            }

            // Admin → ALL users
            elseif ($user->hasRole('admin')) {
                $dropdowns->put('assignees', User::userDropdownValues());
            }

            // Others → empty
            else {
                $dropdowns->put('assignees', []);
            }
        }

        return response()->json($dropdowns);
    }
}
