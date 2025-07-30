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
        Schema::create('supplier_scrutiny_bts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('vendor_id')->nullable();
            $table->foreign('vendor_id')->references('id')->on('vendors')->onDelete('cascade');
            $table->string('supplier_name')->nullable();
            $table->string('gst_number');
            $table->string('gst_status',10);
            $table->date('gst_last_filing_date');
            $table->string('previousnongstinvoice',100);
            $table->boolean('undertaking_accountant')->nullable();
            $table->foreignId('business_task_id');
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
        Schema::dropIfExists('supplier_scrutiny_bts');
    }
};
