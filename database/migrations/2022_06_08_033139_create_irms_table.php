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
        Schema::create('irms', function (Blueprint $table) {
            $table->id();
            $table->string('irm_sys_id')->nullable();
            $table->string('reference_no');
            $table->date('remittance_date');
            $table->unsignedBigInteger('currency_id');
            $table->foreign('currency_id')->references('id')->on('currencies');
            $table->double('received_amount');
            $table->double('outstanding_amount')->nullable();
            $table->double('invoice_amount')->nullable();
            $table->unsignedBigInteger('buyer_id');
            $table->unsignedBigInteger('invoice_id')->nullable();
            $table->boolean('map_to_trade')->default(0);
            $table->foreign('buyer_id')->references('id')->on('customers');
            $table->longText('consignee_ids')->nullable();
            $table->bigInteger('business_task_id')->nullable();
            $table->string('shipment_type', 255)->nullable();
            $table->string('bank_id');
            $table->unsignedBigInteger('company_id')->default(1);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('irms');
    }
};
