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
        Schema::create('disqualified_opportunities', function (Blueprint $table) {
            $table->id(); // Auto-incrementing primary key
            $table->string('disqualified_opportunity'); // Name or description of the opportunity
            $table->timestamps(); // Created_at and updated_at fields
    
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disqualified_opportunities');
    }
};
