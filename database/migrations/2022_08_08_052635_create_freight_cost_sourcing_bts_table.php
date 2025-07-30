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
        Schema::create('freight_cost_sourcing_bts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_task_id');
            $table->bigInteger('ffd_id')->nullable();
            $table->string('freight_agent')->nullable();
            $table->string('pick_up_location')->nullable();
            $table->string('delivery_location')->nullable();
            $table->string('quoting_price')->nullable();
            $table->string('rate_contract_price')->nullable()->default(0);
            $table->string('contact_person_name')->nullable();
            $table->string('contact_person_email')->nullable();
            $table->string('contact_person_phone')->nullable();
            $table->string('budget',15)->nullable()->default(0);
            $table->string('freight_cost_invoice')->nullable();
            $table->string('tender_status',15)->nullable()->nullable();
            $table->string('vessel_airline_name')->nullable();
            $table->date('vessel_airline_date')->nullable();
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
        Schema::dropIfExists('freight_cost_sourcing_bts');
    }
};
