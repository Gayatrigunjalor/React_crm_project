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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('cust_id');
            $table->unsignedBigInteger('customer_type_id');
            $table->foreign('customer_type_id')->references('id')->on('customer_types');
            $table->unsignedBigInteger('segment_id');
            $table->foreign('segment_id')->references('id')->on('segments');
            $table->unsignedBigInteger('category_id');
            $table->foreign('category_id')->references('id')->on('categories');
            $table->unsignedBigInteger('customer_base_id');
            $table->foreign('customer_base_id')->references('id')->on('customer_bases');
            $table->string('address')->nullable();
            $table->unsignedBigInteger('country_id');
            $table->foreign('country_id')->references('id')->on('countries');
            $table->string('city', 50);
            $table->string('time_zone', 20)->nullable();
            $table->string('pin_code', 30)->nullable();
            $table->string('website', 50)->nullable();
            $table->string('country_code', 50)->nullable();
            $table->string('area_code', 50)->nullable();
            $table->string('contact_no', 20);
            $table->string('contact_person');
            $table->string('designation');
            $table->string('landline_no', 50)->nullable();
            $table->string('email', 100);
            $table->string('alternate_email', 100)->nullable();
            $table->string('mobile_number', 20)->nullable();
            $table->string('i_am_member_since', 200)->nullable();
            $table->integer('checker_id')->nullable();
            $table->string('employee_name');
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
        Schema::dropIfExists('customers');
    }
};
