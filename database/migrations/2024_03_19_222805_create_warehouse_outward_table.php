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
        Schema::create('warehouse_outward', function (Blueprint $table) {
            $table->id();
            $table->string('outward_sys_id',255);
            $table->date('outward_date')->nullable();
            $table->unsignedBigInteger('inward_id');
            $table->unsignedBigInteger('invoice_id');
            $table->string('eway_bill_number', 255)->default(0);
            $table->date('eway_bill_date')->nullable();
            $table->string('eway_bill_attachment', 255)->nullable();
            $table->integer('created_by')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('inward_id')->references('id')->on('warehouse')->onDelete('cascade');
            $table->foreign('invoice_id')->references('id')->on('invoices')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('warehouse_outward');
    }
};
