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
        Schema::create('sub_task_check_lists', function (Blueprint $table) {
            $table->id();
            $table->text('checklist');
            $table->string('status',1)->default(0);
            $table->unsignedBigInteger('sub_task_id');
            $table->foreign('sub_task_id')->references('id')->on('sub_tasks')->onDelete('cascade');
            $table->unsignedBigInteger('created_by');
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
        Schema::dropIfExists('sub_task_check_lists');
    }
};
