<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateOpportunityDetailsTable extends Migration
{
    public function up()
    {
        Schema::create('opportunity_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('lead_id');
            $table->unsignedBigInteger('cust_id');
            $table->string('buying_plan')->nullable();
            $table->string('attachment')->nullable();
            $table->string('name')->nullable();
            $table->string('mo_no')->nullable();
            $table->string('email')->nullable();
            $table->text('customer_specific_need')->nullable();
            $table->string('inorbvict_commitment')->nullable();
            $table->text('remark')->nullable();
            $table->boolean('key_opportunity')->default(0); // 1 or 0
            $table->text('extra_chatboat_notes')->nullable();
            $table->string('lead_ack_status')->nullable();
            $table->timestamps();

            $table->foreign('lead_id')->references('id')->on('leads')->onDelete('cascade');
            $table->foreign('cust_id')->references('id')->on('lead_customers')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('opportunity_details');
    }
}
