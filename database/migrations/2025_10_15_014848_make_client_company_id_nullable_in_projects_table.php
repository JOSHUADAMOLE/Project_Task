<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->unsignedBigInteger('client_company_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
   public function down(): void
    {
        // Clean invalid values before making NOT NULL
        DB::table('projects')
            ->whereNull('client_company_id')
            ->update(['client_company_id' => 1]); // or any valid default ID

        Schema::table('projects', function (Blueprint $table) {
            $table->unsignedBigInteger('client_company_id')->nullable(false)->change();
        });
    }
};
