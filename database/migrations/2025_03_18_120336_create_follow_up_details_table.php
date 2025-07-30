<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('follow_up_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('follow_up_id');
            $table->unsignedBigInteger('lead_id');
            $table->unsignedBigInteger('customer_id');
            $table->string('type'); // Follow-up type (e.g., Another Follow-up, Negotiation, etc.)
            $table->date('date'); 
            $table->text('data');   // Dynamic input data (reason, date, etc.)
            $table->timestamps();

            $table->foreign('follow_up_id')->references('id')->on('follow_ups')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('follow_up_details');
    }
};
