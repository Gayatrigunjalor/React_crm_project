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
        Schema::table('procurement_vendors', function (Blueprint $table) {
            $table->unsignedBigInteger('procurement_product_id')->nullable()->after('procurement_id');
            $table->string('product_identifying_name')->nullable()->after('procurement_product_id');
            $table->foreign('procurement_product_id')->references('id')->on('procurement_products')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('procurement_vendors', function (Blueprint $table) {
            $table->dropColumn('procurement_product_id');
            $table->dropColumn('product_identifying_name');
        });
    }
};
