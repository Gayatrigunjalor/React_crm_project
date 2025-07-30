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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('user_ids')->nullable();
            $table->string('priority')->nullable();
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();
            $table->integer('e_hours')->nullable();
            $table->integer('e_minutes')->nullable();
            $table->integer('e_seconds')->nullable();
            $table->string('task_type',20);
            $table->unsignedBigInteger('stage_id');
            $table->boolean('timer_status')->default(0);
            $table->string('kpi_year', 5)->nullable();
            $table->string('kpi_month', 12)->nullable();
            $table->string('sprint_point',10)->nullable();
            $table->string('target_type')->nullable();
            $table->string('target_value')->nullable();
            $table->string('target_completed')->nullable();
            $table->string('target_remaining')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('stage_id')->references('id')->on('stages')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tasks');
    }
};
