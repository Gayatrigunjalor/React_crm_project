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
        Schema::create('irm_payment_histories', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('irm_id');
            $table->foreign('irm_id')->references('id')->on('irms');
            $table->double('received_amount');
            $table->double('outstanding_amount');
            $table->double('invoice_amount');
            $table->unsignedBigInteger('invoice_id');
            $table->string('reference_no');
            $table->date('remittance_date')->nullable();
            $table->unsignedBigInteger('currency_id');
            $table->unsignedBigInteger('buyer_id');
            $table->unsignedBigInteger('consignee_id')->nullable();
            $table->double('old_outstanding_amount');
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
        Schema::dropIfExists('irm_payment_histories');
    }
};
