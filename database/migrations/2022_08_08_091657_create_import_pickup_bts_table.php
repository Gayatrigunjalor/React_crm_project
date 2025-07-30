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
        Schema::create('import_pickup_bts', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('ffd_id')->nullable();
            $table->string('email_id')->nullable();
            $table->string('contact_no')->nullable();
            $table->string('ffd_name')->nullable();
            $table->string('agent_name')->nullable();
            $table->string('kyc_done')->nullable();
            $table->string('pick_up_reference_number')->nullable();
            $table->string('pick_up_booking_date')->nullable();
            $table->string('expected_document_handover')->nullable();
            $table->string('followup_reminder_importer')->nullable();
            $table->foreignId('business_task_id');
            $table->foreign('business_task_id')->references('id')->on('business_tasks')->onDelete('cascade');
            $table->foreignId('created_by');
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
        Schema::dropIfExists('import_pickup_bts');
    }
};
