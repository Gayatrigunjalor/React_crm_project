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
        Schema::create('procurement_vendors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id');
            $table->foreignId('procurement_id');
            $table->date('delivery_date');
            $table->string('warranty');
            $table->string('mfg_year');
            $table->string('ready_stock_availability');
            $table->string('lead_time');
            $table->string('payment_term');
            $table->string('product_cost');
            $table->unsignedBigInteger('gst_percent_id');
            $table->string('grand_total');
            $table->string('transportation_cost');
            $table->string('installation_cost');
            $table->string('make');
            $table->string('model');
            $table->foreignId('product_type_id');
            $table->foreignId('product_condition_id');
            $table->string('expiry_period');
            $table->integer('checker_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('rejected_by')->nullable();
            $table->boolean('rejected')->nullable();
            $table->boolean('approved')->nullable();
            $table->unsignedBigInteger('attachment_id')->nullable();
            $table->foreign('attachment_id')->references('id')->on('procurement_attachments')->onDelete('cascade');
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
        Schema::dropIfExists('procurement_vendors');
    }
};
