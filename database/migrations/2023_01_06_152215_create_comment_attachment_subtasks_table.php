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
        Schema::create('comment_attachment_subtasks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('comment_id');
            $table->foreign('comment_id')->references('id')->on('sub_task_time_lines')->onDelete('cascade');
            $table->string('image');
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
        Schema::dropIfExists('comment_attachment_subtasks');
    }
};
