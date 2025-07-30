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
        Schema::create('warehouse_grns', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inward_id')->unsigned();
            $table->string('grn_number', 50);
            $table->unsignedBigInteger('purchase_order_id')->nullable();
            $table->string('vendor_tax_invoice_number')->nullable();
            $table->date('vendor_tax_invoice_date')->nullable();
            $table->string('vendor_tax_invoice_attachment')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('inward_id')->references('id')->on('warehouse')->onDelete('cascade');
            $table->foreign('purchase_order_id')->references('id')->on('purchase_orders')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('warehouse_grns');
    }
};
