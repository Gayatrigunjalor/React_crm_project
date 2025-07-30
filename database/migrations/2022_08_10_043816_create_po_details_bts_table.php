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
        Schema::create('po_details_bts', function (Blueprint $table) {
            $table->id();
            $table->string('vendor_name_po');
            $table->bigInteger('purchase_order_id')->nullable();
            $table->string('po_number',20)->nullable();
            $table->string('po_amount',40);
            $table->date('po_due_date');
            $table->string('payment_term',70);
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
        Schema::dropIfExists('po_details_bts');
    }
};
