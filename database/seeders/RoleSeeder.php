<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public static $roles = [
        'developer',
        'qa engineer',
        'designer',
        'client',
        'head implementation',
        'admin',
        'team leader',
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::$roles as $role) {
            Role::create(['name' => $role]);
        }
    }
}
