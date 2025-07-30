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
        Schema::create('quotation_products', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            $table->foreignId('pi_order_id');
            $table->foreignId('product_id');
            $table->string('quantity');
            $table->string('tax');
            $table->double('tax_amount');
            $table->double('rate');
            $table->double('rate_with_tax');
            $table->double('amount');
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
        Schema::dropIfExists('quotation_products');
    }
};
