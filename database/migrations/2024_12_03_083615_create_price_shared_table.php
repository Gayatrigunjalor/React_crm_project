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
        Schema::create('price_shareds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade'); // Foreign key for customer
            $table->foreignId('lead_id')->constrained()->onDelete('cascade'); // Foreign key for lead
            $table->boolean('status')->nullable(); // Status of the inquiry
            $table->string('product')->nullable(); // Product name
            $table->string('model')->nullable(); // Model
            $table->string('make')->nullable(); // Make of the product
            $table->integer('quantity')->nullable(); // Quantity
            $table->decimal('target_price', 10, 2)->nullable(); // Target price for the product
            $table->integer('quoted_price')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_shareds');
    }
};
