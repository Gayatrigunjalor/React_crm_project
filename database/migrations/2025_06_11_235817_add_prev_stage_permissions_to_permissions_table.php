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
        Schema::table('permissions', function (Blueprint $table) {
            $table->boolean('prev_stage_list')->default(false);
            $table->boolean('prev_stage_create')->default(false);
            $table->boolean('prev_stage_edit')->default(false);
            $table->boolean('prev_stage_delete')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn([
                'prev_stage_list',
                'prev_stage_create',
                'prev_stage_edit',
                'prev_stage_delete'
            ]);
        });
    }
};
