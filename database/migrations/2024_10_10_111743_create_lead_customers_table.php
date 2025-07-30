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
        Schema::create('lead_customers', function (Blueprint $table) {
            $table->id();
            $table->string('sender_name')->nullable();
            $table->string('sender_mobile')->unique()->nullable(); // Add unique constraint if needed
            $table->string('sender_email')->nullable();
            $table->string('sender_company')->nullable();
            $table->string('sender_address')->nullable();
            $table->string('sender_city')->nullable();
            $table->string('sender_state')->nullable();
            $table->string('sender_pincode')->nullable();
            $table->string('sender_country_iso')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lead_customers');
    }
};
