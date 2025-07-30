<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('customer_contact_persons', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('lead_id');
            $table->unsignedBigInteger('lead_cust_id'); // Reference to customer ID in leads
            $table->string('contact_person_name');
            $table->string('city')->nullable();
            $table->string('country')->nullable();
            $table->string('mobile_no')->nullable();
            $table->string('address')->nullable();
            $table->string('pincode')->nullable();
            $table->string('state')->nullable();
            $table->string('email')->nullable();
            $table->string('designation')->nullable();
            $table->timestamps();
        
            $table->foreign('lead_id')->references('id')->on('leads')->onDelete('cascade');
            $table->foreign('lead_cust_id')->references('id')->on('lead_customers')->onDelete('cascade');
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
