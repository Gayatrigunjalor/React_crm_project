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
        Schema::create('port_of_landing_bts', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('ffd_id')->nullable();
            $table->string('agent_name')->nullable();
            $table->string('freight_cost')->nullable();
            $table->string('po_no')->nullable();
            $table->string('pickup_refrence_number')->nullable();
            $table->date('pickup_booking_date')->nullable();
            $table->string('delivery_location')->nullable();
            $table->string('expected_shipment')->nullable();
            $table->date('accepted_shipment_delivery_date')->nullable();
            $table->date('follow_up_port_of_landing')->nullable();
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
        Schema::dropIfExists('port_of_landing_bts');
    }
};
