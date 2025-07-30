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
        Schema::create('logistics_compliances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id');
            $table->foreignId('ffd_id')->nullable();
            $table->string('pickup_proof');
            $table->string('e_way_bill')->nullable();
            $table->string('delivery_challan');
            $table->string('id_card');
            $table->string('kyc');
            $table->string('delivery_boy_photo')->nullable();
            $table->string('cargo_pickup_agent')->nullable();
            $table->string('ffd_quotation')->nullable();
            $table->string('insurance_attachment')->nullable();
            $table->string('other_attachment')->nullable();
            $table->integer('checker_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('rejected_by')->nullable();
            $table->boolean('rejected')->nullable();
            $table->boolean('approved')->nullable();
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
        Schema::dropIfExists('logistics_compliances');
    }
};
