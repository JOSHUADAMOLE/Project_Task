<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->string('pricing_type')->nullable()->change();
            $table->boolean('hidden_from_clients')->nullable()->change();
            $table->boolean('billable')->nullable()->change();
        });
    }

    public function down(): void
    {
        // 🧹 Clean invalid data first to avoid truncation
        DB::table('tasks')
            ->whereNull('pricing_type')
            ->orWhere('pricing_type', '')
            ->update(['pricing_type' => 'hourly']);

        Schema::table('tasks', function (Blueprint $table) {
            if (Schema::hasColumn('tasks', 'pricing_type')) {
                // Restore to required + default safely
                $table->string('pricing_type')->default('hourly')->nullable(false)->change();
            }

            if (Schema::hasColumn('tasks', 'hidden_from_clients')) {
                $table->boolean('hidden_from_clients')->default(false)->nullable(false)->change();
            }

            if (Schema::hasColumn('tasks', 'billable')) {
                $table->boolean('billable')->default(true)->nullable(false)->change();
            }
        });
    }
};
