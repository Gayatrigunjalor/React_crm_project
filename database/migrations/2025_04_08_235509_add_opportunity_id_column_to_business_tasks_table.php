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
        Schema::table('business_tasks', function (Blueprint $table) {
            $table->string('opportunity_id')->nullable()->after('date')->default(null);
            $table->date('opportunity_date')->nullable()->after('opportunity_id')->default(null);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('business_tasks', function (Blueprint $table) {
            $table->dropColumn('opportunity_id');
            $table->dropColumn('opportunity_date');
        });
    }
};
