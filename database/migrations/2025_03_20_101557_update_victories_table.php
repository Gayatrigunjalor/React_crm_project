<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('victories', function (Blueprint $table) {
            $table->id();
            $table->boolean('deal_won')->default(false);
            $table->unsignedBigInteger('lead_id');
            $table->unsignedBigInteger('customer_id');
            $table->boolean('status')->default(false);
            $table->timestamps();

            $table->foreign('lead_id')->references('id')->on('leads')->onDelete('cascade');
            $table->foreign('customer_id')->references('id')->on('lead_customers')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('victories');
    }
};