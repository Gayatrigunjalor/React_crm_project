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
        Schema::create('vendor_purchase_invoice', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('purchase_order_id')->nullable();
            $table->string('purchase_invoice_no');
            $table->date('purchase_invoice_date');
            $table->bigInteger('business_task_id')->nullable();
            $table->bigInteger('vendor_id')->nullable();
            $table->float('base_amount', 10, 2);
            $table->string('gst_percent');
            $table->string('gst_amount');
            $table->string('tds_deduction');
            $table->float('tds_amount', 10, 2);
            $table->float('net_payable', 10, 2);
            $table->float('paid_amount', 10,2)->nullable();
            $table->string('bank_name')->nullable();
            $table->string('utr_number')->nullable();
            $table->string('utr_date')->nullable();
            $table->bigInteger('created_by')->nullable();
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
        Schema::dropIfExists('vendor_purchase_invoice');
    }
};
