<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function index()
    {
        $teams = Team::withCount('users')->get();

        return Inertia::render('Teams/Index', [
            'teams' => $teams
        ]);
    }

    public function create()
    {
        return Inertia::render('Teams/Create');
    }

    public function store(Request $request)
    {
        $request->validate(['name' => 'required']);

        Team::create(['name' => $request->name]);

        return redirect()->route('teams.index');
    }

    public function show(Team $team)
    {
        $team->load(['users.roles']); // load users and their roles

        return Inertia::render('Teams/Show', [
            'team' => $team,
            'members' => $team->users,
        ]);
    }


    public function destroy(Team $team)
    {
        $team->delete();
        return redirect()->route('teams.index')
            ->with('success', 'Team deleted successfully.');
    }
    public function members(Team $team)
    {
        $users = $team->users()
            ->with(['roles:id,name', 'teams:id,name'])
            ->orderByRaw("CASE 
                WHEN EXISTS (
                    SELECT 1 FROM model_has_roles 
                    WHERE model_has_roles.model_id = users.id 
                    AND model_has_roles.role_id = (
                        SELECT id FROM roles WHERE name = 'Team Leader'
                    )
                ) THEN 0
                ELSE 1
            END")
            ->paginate(12);

        return Inertia::render('Teams/Members', [
            'team' => $team,
            'items' => $users,
        ]);
    }
    public function removeMember(Team $team, User $user)
    {
        // Detach the user from the team
        $team->users()->detach($user->id);

        return redirect()->back()->with('success', 'Member removed from team.');
    }



}