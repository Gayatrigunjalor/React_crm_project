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
        Schema::create('regulatory_dashboards', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id');
            $table->string('shipping_bill_no');
            $table->date('shipping_bill_date');
            $table->string('port_code')->nullable();
            $table->string('awb_no');
            $table->date('awb_date')->nullable();
            $table->string('cha')->nullable();
            $table->string('egm_no');
            $table->date('egm_date');
            $table->string('invoice');
            $table->string('awb');
            $table->string('shipping_bill');
            $table->string('packing_list');
            $table->string('other')->nullable();
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
        Schema::dropIfExists('regulatory_dashboards');
    }
};
