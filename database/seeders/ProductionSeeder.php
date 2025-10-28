<?php

namespace Database\Seeders;

use App\Models\OwnerCompany;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ProductionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure the 'admin' role exists
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin', 'guard_name' => 'web']
        );

        // Create or update the admin user
        $admin = User::updateOrCreate(
            ['email' => config('auth.admin.email', 'admin@mail.com')],
            [
                'name' => config('auth.admin.name', 'Admin'),
                'phone' => '',
                'rate' => 0,
                'job_title' => 'Owner',
                'avatar' => null,
                'password' => Hash::make(config('auth.admin.password', 'password')),
                'remember_token' => null,
            ]
        );

        // Assign admin role if not already assigned
        if (! $admin->hasRole('admin')) {
            $admin->assignRole($adminRole);
        }

        // Create or update the owner company record
        OwnerCompany::updateOrCreate(
            ['name' => config('app.name', 'Default Company')],
            [
                'logo' => null,
                'address' => '',
                'postal_code' => '',
                'city' => '',
                'country_id' => null,
                'currency_id' => 97, // Default PHP peso or USD
                'phone' => '',
                'web' => '',
                'tax' => 0,
                'email' => '',
                'iban' => '',
                'swift' => '',
                'business_id' => '',
                'tax_id' => '',
                'vat' => '',
            ]
        );

        $this->command->info('✅ ProductionSeeder ran successfully! Admin and OwnerCompany created or updated.');
    }
}
