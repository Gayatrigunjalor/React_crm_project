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
        Schema::create('product_vendors', function (Blueprint $table) {
            $table->id();
            $table->string('purchase_price');
            $table->foreignId('vendor_id');
            $table->foreign('vendor_id')->references('id')->on('vendors');
            $table->string('product_id');
            $table->string('gst');
            $table->string('gst_amount');
            $table->string('total_amount');
            $table->string('shipping_charges');
            $table->string('packaging_charges');
            $table->string('other_charges');
            $table->string('remark')->nullable();
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
        Schema::dropIfExists('product_vendors');
    }
};
