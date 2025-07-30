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
        Schema::create('warehouse', function (Blueprint $table) {
            $table->id();
            $table->string('inward_sys_id',255);
            $table->date('inward_date');
            $table->string('mode_of_shipment')->nullable();
            $table->string('terms_of_shipment')->nullable();
            $table->bigInteger('proforma_invoice_id')->nullable();
            $table->bigInteger('business_task_id')->nullable();
            $table->string('port_of_loading', 255)->nullable();
            $table->string('port_of_discharge', 255)->nullable();
            $table->bigInteger('inco_term_id')->nullable();
            $table->string('pickup_location')->nullable();
            $table->date('outward_date')->nullable();
            $table->integer('mark_as_outward')->default(0);
            $table->bigInteger('invoice_id')->default(0);
            $table->string('eway_bill_number')->nullable();
            $table->date('packaging_date')->nullable();
            $table->tinyInteger('packaging_done')->nullable();
            $table->text('packaging_remark')->nullable();
            $table->bigInteger('psd_id')->default(0);
            $table->date('psd_date')->nullable();
            $table->tinyInteger('psd_done')->default(0);
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
        Schema::dropIfExists('warehouse');
    }
};
