<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('feedbacks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->tinyInteger('service_satisfaction'); // 1-5 rating
            $table->tinyInteger('overall_experience');   // 1-5 rating
            $table->boolean('recommend_services');
            $table->boolean('met_expectations');
            $table->tinyInteger('service_quality');      // 1-5 rating
            $table->boolean('timely_address');
            $table->tinyInteger('support_satisfaction'); // 1-5 rating
            $table->boolean('team_friendliness');
            $table->boolean('felt_heard');
            $table->boolean('speed_of_delivery');
            $table->boolean('worth_price');
            $table->boolean('compare_competitors');
            $table->text('delay_description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feedbacks');
    }
};
