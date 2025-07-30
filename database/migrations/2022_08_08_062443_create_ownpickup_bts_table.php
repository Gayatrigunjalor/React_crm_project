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
        Schema::create('ownpickup_bts', function (Blueprint $table) {
            $table->id();
            $table->string('pick_up_location')->nullable();
            $table->string('delivery_location')->nullable();
            $table->bigInteger('ffd_id')->nullable();
            $table->string('agent_name')->nullable();
            $table->string('opu_freight_cost')->nullable();
            $table->string('purchase_order_no')->nullable();
            $table->string('pickup_refrence_number')->nullable();
            $table->string('pick_up_booking_date')->nullable();
            $table->string('accepted_shipment_arrival_date')->nullable();
            $table->string('own_pick_up_follow_up')->nullable();
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
        Schema::dropIfExists('ownpickup_bts');
    }
};
