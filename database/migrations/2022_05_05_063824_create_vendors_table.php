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
        Schema::create('vendors', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('vender_type_id')->nullable();
            $table->string('employee_name');
            $table->string('entity_type_id');
            $table->string('segment_id')->nullable();
            $table->string('country_id')->nullable();
            $table->string('state_id')->nullable();
            $table->string('address');
            $table->string('city', 50)->nullable();
            $table->string('pin_code', 20)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('website', 50)->nullable();
            $table->string('vendor_behavior_id');
            $table->string('rating', 5);
            $table->string('contact_person');
            $table->string('contact_person_number');
            $table->string('designation');
            $table->string('email', 100)->nullable();
            $table->string('collaboration_interest', 5);
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
        Schema::dropIfExists('vendors');
    }
};
