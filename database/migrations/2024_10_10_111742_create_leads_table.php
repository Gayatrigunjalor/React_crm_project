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
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('unique_query_id');
            $table->string('query_type')->nullable();
            $table->timestamp('query_time')->nullable();
            $table->string('sender_name')->nullable();
            $table->string('sender_mobile')->nullable();
            $table->string('sender_email')->nullable();
            $table->string('sender_company')->nullable();
            $table->text('sender_address')->nullable();
            $table->string('sender_city')->nullable();
            $table->string('sender_state')->nullable();
            $table->string('sender_pincode')->nullable();
            $table->string('sender_country_iso')->nullable();
            $table->string('sender_mobile_alt')->nullable();
            $table->string('sender_email_alt')->nullable();
            $table->string('query_product_name')->nullable();
            $table->text('query_message')->nullable()->nullable();
            $table->string('query_mcat_name')->nullable();
            $table->string('call_duration')->nullable()->nullable();
            $table->string('receiver_mobile')->nullable()->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
