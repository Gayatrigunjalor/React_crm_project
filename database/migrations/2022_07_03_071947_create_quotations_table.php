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
        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->string('pi_number', 100);
            $table->date('pi_date');
            $table->unsignedBigInteger('buyer_id');
            $table->foreignId('consignee_id')->nullable();
            $table->string('sales_manager_id');
            $table->string('document_type',60);
            $table->foreignId('bank_id');
            $table->foreignId('business_task_id')->nullable();
            $table->string('state_code')->nullable();
            $table->foreignId('currency_id')->nullable();
            $table->string('exchange_rate')->nullable();
            $table->string('port_of_loading')->nullable();
            $table->string('port_of_discharge')->nullable();
            $table->string('final_destination')->nullable();
            $table->string('origin_country')->nullable();
            $table->foreignId('inco_term_id')->nullable();
            $table->string('net_weight')->nullable();
            $table->string('gross_weight')->nullable();
            $table->double('igst')->nullable();
            $table->double('cgst')->nullable();
            $table->double('sgst')->nullable();
            $table->double('shipping_cost')->nullable();
            $table->double('total');
            $table->double('grand_total');
            $table->longText('terms_and_conditions')->nullable();
            $table->string('pi_product_ids')->nullable();
            $table->foreign('buyer_id')->references('id')->on('customers');
            $table->integer('checker_id')->nullable();
            $table->unsignedBigInteger('company_id')->default(1);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('rejected_by')->nullable();
            $table->boolean('rejected')->nullable();
            $table->boolean('approved')->nullable();
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
        Schema::dropIfExists('quotations');
    }
};
