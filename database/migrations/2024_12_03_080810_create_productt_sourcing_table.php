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
        Schema::create('product_sourcings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('customer_id');
            $table->unsignedBigInteger('lead_id');
            $table->enum('product_sourcing', ['yes', 'no']);
            $table->string('product_name');
            $table->string('make');
            $table->string('model');
            $table->integer('quantity');
            $table->decimal('target_price', 10, 2);
            $table->string('product_code');
            $table->unsignedBigInteger('procurement_id');
            $table->string('status')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade');
            $table->foreign('lead_id')->references('id')->on('leads')->onDelete('cascade');
            $table->foreign('procurement_id')->references('id')->on('procurements')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_sourcing');
    }
};
