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
        Schema::table('business_tasks', function (Blueprint $table) {
            $table->date('date')->nullable()->change();
            $table->integer('segment')->nullable()->change();
            $table->integer('category')->nullable()->change();
            $table->string('sde_team')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('business_tasks', function (Blueprint $table) {
            $table->date('date');
            $table->integer('segment');
            $table->integer('category');
            $table->string('sde_team');
        });
    }
};
