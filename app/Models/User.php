<?php

namespace App\Models;

use App\Services\PermissionService;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Lacodix\LaravelModelFilter\Traits\IsSearchable;
use Lacodix\LaravelModelFilter\Traits\IsSortable;
use Laravel\Sanctum\HasApiTokens;
use LaravelArchivable\Archivable;
use Overtrue\LaravelFavorite\Traits\Favoriter;
use OwenIt\Auditing\Auditable;
use OwenIt\Auditing\Contracts\Auditable as AuditableContract;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements AuditableContract, CanResetPasswordContract
{
    use Archivable, Auditable, CanResetPassword, Favoriter, HasApiTokens, HasFactory, HasRoles, IsSearchable, IsSortable, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'job_title',
        'avatar',
        'phone',
        'rate',
        'google_id',
    ];

    protected $searchable = [
        'name',
        'email',
        'job_title',
    ];

    protected $sortable = [
        'name' => 'asc',
        'email',
        'rate',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function getFirstName(): string
    {
        return Str::beforeLast($this->name, ' ');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function isNotAdmin(): bool
    {
        return ! $this->isAdmin();
    }

    public function clientCompanies(): BelongsToMany
    {
        return $this->belongsToMany(ClientCompany::class, 'client_company', 'client_id', 'client_company_id');
    }

    /**
     * Projects that user can access
     */
    public function tasks()
    {
        return $this->hasMany(Task::class, 'assigned_to_user_id');
    }
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_user_access');
    }

    public function subscribedToTasks(): BelongsToMany
    {
        return $this->belongsToMany(Task::class, 'subscribe_task');
    }

    public function hasProjectAccess(Project $project): bool
    {
        // Admin always has access
        if ($this->hasRole('admin')) {
            return true;
        }

        // Direct project access
        if ($project->users()->where('users.id', $this->id)->exists()) {
            return true;
        }

        // Access through team leader → team members inherit access
        $teamLeaderIds = $project->users()
            ->whereHas('roles', fn($q) => $q->where('name', 'team leader'))
            ->pluck('id');

        return $this->teams()
            ->whereIn('teams.id', function ($query) use ($teamLeaderIds) {
                $query->select('team_id')
                    ->from('team_user')
                    ->whereIn('user_id', $teamLeaderIds);
            })
            ->exists();
    }

    public static function userDropdownValues($exclude = ['client']): array
    {
        return self::orderBy('name')
            ->withoutRole($exclude)
            ->get(['id', 'name'])
            ->map(fn ($i) => ['value' => (string) $i->id, 'label' => $i->name])
            ->toArray();
    }

    public static function clientDropdownValues(): array
    {
        return self::orderBy('name')
            ->role('client')
            ->get(['id', 'name'])
            ->map(fn ($i) => ['value' => (string) $i->id, 'label' => $i->name])
            ->toArray();
    }

   public function teams()
    {
        return $this->belongsToMany(Team::class, 'team_user', 'user_id', 'team_id');
    }

    public function teamMembers()
    {
        // Get all users in the same teams as the current user, excluding themselves
        return $this->teams()
            ->with('users') // eager load users in each team
            ->get()         // collection of teams
            ->pluck('users') // get users collection from each team
            ->flatten()      // merge collections into one
            ->unique('id')   // remove duplicate users
            ->reject(fn($user) => $user->id === $this->id) // exclude self (leader)
            ->values();      // reset keys
    }




}
