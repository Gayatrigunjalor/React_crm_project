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
        Schema::create('payment_history_bts', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('po_id')->nullable();
            $table->string('po_invoice_number');
            $table->string('po_invoice_amount');
            $table->string('paid_amount');
            $table->string('balance_amount', 100);
            $table->bigInteger('business_task_id')->unsigned();
            $table->string('tds_amount');
            $table->string('tds_rate');
            $table->string('gst_rate');
            $table->string('gst_amount');
            $table->string('gst_type');
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
        Schema::dropIfExists('payment_history_bts');
    }
};
