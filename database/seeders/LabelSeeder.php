<?php

namespace Database\Seeders;

use App\Models\Label;
use Illuminate\Database\Seeder;

class LabelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Label::insert([
            ['name' => 'Completed', 'color' => '#37B24D'],
            ['name' => 'Incomplete', 'color' => '#F03E3E'],
            ['name' => 'InProgress', 'color' => '#F76707'],
        ]);
    }
}
