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
        Schema::create('pm_worksheet_bts', function (Blueprint $table) {
            $table->id();
            $table->string('make1')->nullable();
            $table->string('model1')->nullable();
            $table->string('supplier_name2')->nullable();
            $table->string('warranty_extension')->nullable();
            $table->string('product_authenticity')->nullable();
            $table->string('physical_verification')->nullable();
            $table->string('lead_time')->nullable();
            $table->string('custvsvendcommitment')->nullable();
            $table->string('expiry')->nullable();
            $table->string('proformainvvsvendorqot')->nullable();
            $table->string('quantity1')->nullable();
            $table->string('technicalspecipm')->nullable();
            $table->string('productspecicrutiny')->nullable();
            $table->string('condition1', 10)->nullable();
            $table->string('product_type1', 15)->nullable();
            $table->string('transportation_cost', 50)->nullable();
            $table->string('warrenty', 50)->nullable();
            $table->string('year_of_manufacturing1', 30)->nullable();
            $table->string('packaging_cost', 40)->nullable();
            $table->string('ready_stock_quantity')->nullable();
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
        Schema::dropIfExists('pm_worksheet_bts');
    }
};
