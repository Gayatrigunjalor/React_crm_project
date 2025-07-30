<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('business_task_teams', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sde');
            $table->unsignedBigInteger('bpe')->nullable();
            $table->unsignedBigInteger('deo')->nullable();
            $table->unsignedBigInteger('pm')->nullable();
            $table->unsignedBigInteger('lm')->nullable();
            $table->unsignedBigInteger('cm')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('business_task_teams');
    }
};
