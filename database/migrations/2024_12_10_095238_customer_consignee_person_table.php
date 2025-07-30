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
        Schema::create('customer_consignees', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('lead_id');
            $table->unsignedBigInteger('cust_id'); // Reference to customer ID
            $table->string('contact_person_name');
            $table->string('add')->nullable();
            $table->string('city')->nullable();
            $table->string('pincode')->nullable();
            $table->string('country')->nullable();
            $table->string('state')->nullable();
            $table->string('mo_no')->nullable();
            $table->string('email')->nullable();
            $table->string('designation')->nullable();
            $table->timestamps();
        
            $table->foreign('lead_id')->references('id')->on('leads')->onDelete('cascade');
            $table->foreign('cust_id')->references('id')->on('lead_customers')->onDelete('cascade');
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
