<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('procurement_products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('procurement_id');
            $table->string('product_service_name');
            $table->text('description');
            $table->string('target_cost')->nullable();
            $table->string('quantity')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->foreign('procurement_id')->references('id')->on('procurements')->onDelete('cascade');
        });

        DB::statement('INSERT INTO procurement_products (`procurement_id`, `product_service_name`, `description`, `target_cost`, `quantity`, `created_at`, `updated_at`, `deleted_at`) SELECT id AS procurement_id, `product_service_name`, `description`, `target_cost`, `rejected_by`, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, null FROM procurements');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('procurement_products');
    }
};
