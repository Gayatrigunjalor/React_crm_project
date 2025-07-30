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
        Schema::create('export_agent_bts', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('ffd_id')->nullable();
            $table->string('agent_name')->nullable();
            $table->string('freight_cost')->nullable();
            $table->string('purchase_order_no')->nullable();
            $table->string('pickup_ref_number')->nullable();
            $table->date('pickup_booking_date')->nullable();
            $table->date('awb_acceptance_date')->nullable();
            $table->date('follow_up_export_agent')->nullable();
            $table->date('accepted_shipment_delivery_date')->nullable();
            $table->date('expected_documents_handover_date')->nullable();
            $table->string('courier_pod_no')->nullable();
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
        Schema::dropIfExists('export_agent_bts');
    }
};
