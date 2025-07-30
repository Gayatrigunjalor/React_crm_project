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
        Schema::create('paiment_history_paid_amount_bts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_history_id');
            $table->string('paid_amount');
            $table->string('bank_name');
            $table->string('utr_number');
            $table->string('utr_date');
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
        Schema::dropIfExists('paiment_history_paid_amount_bts');
    }
};
