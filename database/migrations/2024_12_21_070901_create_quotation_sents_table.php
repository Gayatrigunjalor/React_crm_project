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
        Schema::create('quotation_sents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade'); // Foreign key for customer
            $table->foreignId('lead_id')->constrained()->onDelete('cascade'); // Foreign key for lead
            $table->string('product_name');
            $table->string('make');
            $table->string('model');
            $table->integer('qty');
            $table->decimal('target_price', 10, 2);
            $table->decimal('quoted_price', 10, 2);
            $table->date('date');
            $table->string('status');
            $table->string('pi_number');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quotation_sents');
    }
};
