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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('purchase_order_number', 100);
            $table->date('order_date');
            $table->date('expected_delivery_date');
            $table->string('po_type')->default('goods');
            $table->unsignedBigInteger('ffd_id')->nullable();
            $table->foreign('ffd_id')->references('id')->on('ffds')->onDelete('cascade');
            $table->unsignedBigInteger('vendor_id')->nullable();
            $table->foreign('vendor_id')->references('id')->on('vendors')->onDelete('cascade');
            $table->string('employee_name');
            $table->string('document_type', 60);
            $table->string('state_code', 20)->nullable();
            $table->foreignId('currency_id')->nullable();
            $table->string('exchange_rate')->nullable();
            $table->string('port_of_loading')->nullable();
            $table->string('port_of_discharge')->nullable();
            $table->string('final_destination')->nullable();
            $table->string('origin_country')->nullable();
            $table->foreignId('inco_term_id')->nullable();
            $table->string('net_weight')->nullable();
            $table->string('gross_weight')->nullable();
            $table->double('shp_charge')->nullable();
            $table->double('pkg_charge')->nullable();
            $table->double('other_charge')->nullable();
            $table->double('total');
            $table->double('igst')->nullable();
            $table->double('cgst')->nullable();
            $table->double('sgst')->nullable();
            $table->double('grand_total');
            $table->longText('terms_and_conditions')->nullable();
            $table->string('purchase_order_product_ids')->nullable();
            $table->string('product_names')->nullable();
            $table->bigInteger('business_task_id')->nullable();
            $table->unsignedBigInteger('company_id')->default(1);
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->integer('checker_id')->nullable();
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
        Schema::dropIfExists('purchase_orders');
    }
};
