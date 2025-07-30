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
        Schema::create('serve_by_suppliers_bts', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('ffd_id')->nullable();
            $table->string('pod_lorry_receipt')->nullable();
            $table->string('booking_date')->nullable();
            $table->string('acpcted_shipment_arrivel_date')->nullable();
            $table->string('follow_up_served_by')->nullable();
            $table->string('pod_for_lorry')->nullable();
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
        Schema::dropIfExists('serve_by_suppliers_bts');
    }
};
