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
        Schema::table('tasks', function (Blueprint $table) {
            $table->unsignedBigInteger('kpi_id')->nullable()->after('description');
            $table->foreign('kpi_id')->references('id')->on('kpis');
            $table->unsignedBigInteger('assigned_by')->nullable()->after('target_remaining');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropColumn('kpi_id');
            $table->dropColumn('assigned_by');
        });
    }
};
