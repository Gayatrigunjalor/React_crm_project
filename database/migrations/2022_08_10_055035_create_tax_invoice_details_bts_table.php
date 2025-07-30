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
        Schema::create('tax_invoice_details_bts', function (Blueprint $table) {
            $table->id();
            $table->string('vendornametax');
            $table->string('purchasetaxinvoiceno',50);
            $table->string('tax_invoice_amount',30);
            $table->string('product_name_tax');
            $table->string('quantity_tax');
            $table->string('rate_tax',30);
            $table->boolean('undertaking_pm')->nullable();
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
        Schema::dropIfExists('tax_invoice_details_bts');
    }
};
