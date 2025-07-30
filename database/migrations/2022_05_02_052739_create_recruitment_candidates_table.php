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
        Schema::create('recruitment_candidates', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->unsignedBigInteger('post_id');
            $table->foreign('post_id')->references('id')->on('recruitments');
            $table->string('qualification');
            $table->string('experience');
            $table->string('communication_skill');
            $table->string('address');
            $table->string('email');
            $table->string('mobile', 20);
            $table->string('english_knowledge', 20);
            $table->string('critical_relationship', 20);
            $table->string('energy_level', 20);
            $table->string('distance', 20);
            $table->string('own_vehicle', 10);
            $table->string('readiness_to_join', 10);
            $table->string('working_status', 10);
            $table->string('job_change_reason')->nullable();
            $table->string('current_salary', 20);
            $table->string('expected_salary', 20);
            $table->string('notice_period', 10);
            $table->date('interview_date');
            $table->string('candidate_status')->nullable();
            $table->bigInteger('attachment_id')->unsigned()->nullable();
            $table->integer('checker_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('rejected_by')->nullable();
            $table->boolean('rejected')->nullable();
            $table->boolean('approved')->nullable();
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
        Schema::dropIfExists('recruitment_candidates');
    }
};
