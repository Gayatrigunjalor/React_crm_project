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
        Schema::create('warehouse_box_products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('warehouse_box_id');
            $table->bigInteger('product_code_id');
            $table->bigInteger('product_quantity');
            $table->string('product_hsn', 50)->nullable();
            $table->string('hazardous_symbol', 50)->nullable();
            $table->string('manufacture_year')->nullable();
            $table->text('box_content')->nullable();

            $table->foreign('warehouse_box_id')->references('id')->on('warehouse_box_details')->onDelete('cascade');
            $table->timestamps();
        });

        //DB::statement('INSERT INTO warehouse_box_products (warehouse_box_id, product_code_id, product_quantity, product_hsn, hazardous_symbol, manufacture_year, box_content) SELECT id AS warehouse_box_id, product_code_id, product_quantity, product_hsn, hazardous_symbol, manufacture_year, box_content FROM warehouse_box_details');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('warehouse_box_products');
    }
};
