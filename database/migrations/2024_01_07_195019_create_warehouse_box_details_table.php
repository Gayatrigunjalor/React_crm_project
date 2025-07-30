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
        Schema::create('warehouse_box_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inward_id');
            $table->unsignedBigInteger('grn_sys_id');
            $table->string('box_sys_id', 255);
            $table->bigInteger('purchase_order_id');
            $table->bigInteger('location_detail_id')->nullable();
            $table->bigInteger('product_code_id')->nullable();
            $table->bigInteger('product_quantity')->nullable();
            $table->string('product_hsn')->nullable();
            $table->string('hazardous_symbol', 100)->nullable();
            $table->text('box_content')->nullable();
            $table->string('manufacture_year')->nullable();
            $table->float('net_weight', 10, 2);
            $table->float('gross_weight', 10, 2);
            $table->float('length', 10, 2);
            $table->float('width', 10, 2);
            $table->float('height', 10, 2);
            $table->date('box_packaging_date')->nullable();
            $table->tinyInteger('box_packaging_done')->nullable();
            $table->tinyInteger('box_inspection_done')->nullable();
            $table->string('box_inspection_by',255)->nullable();
            $table->text('box_packaging_remark')->nullable();
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('inward_id')->references('id')->on('warehouse')->onDelete('cascade');
            $table->foreign('grn_sys_id')->references('id')->on('warehouse_grns')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('warehouse_box_details');
    }
};
