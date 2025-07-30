<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('feedbacks', function (Blueprint $table) {
            // Change boolean and tinyInteger columns to string
            $table->string('service_satisfaction')->change();
            $table->string('recommend_services')->change();
            $table->string('met_expectations')->change();
            $table->string('timely_address')->change();
            $table->string('support_satisfaction')->change();
            $table->string('team_friendliness')->change();
            $table->string('felt_heard')->change();
            $table->string('speed_of_delivery')->change();
            $table->string('worth_price')->change();
            $table->string('compare_competitors')->change();
            $table->string('delay_description')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('feedbacks', function (Blueprint $table) {
            // Revert back to original datatypes
            $table->tinyInteger('service_satisfaction')->change();
            $table->boolean('recommend_services')->change();
            $table->boolean('met_expectations')->change();
            $table->boolean('timely_address')->change();
            $table->tinyInteger('support_satisfaction')->change();
            $table->boolean('team_friendliness')->change();
            $table->boolean('felt_heard')->change();
            $table->boolean('speed_of_delivery')->change();
            $table->boolean('worth_price')->change();
            $table->boolean('compare_competitors')->change();
            $table->text('delay_description')->nullable()->change();
        });
    }
};
