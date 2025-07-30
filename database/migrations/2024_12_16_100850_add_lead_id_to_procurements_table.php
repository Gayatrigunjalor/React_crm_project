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
        Schema::table('procurements', function (Blueprint $table) {
            $table->string('proc_number')->nullable()->after('id');
            $table->string('lead_id')->nullable()->after('assignee_name');
            $table->string('lead_customer_id')->nullable()->after('lead_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('procurements', function (Blueprint $table) {
            $table->dropColumn([
                'proc_number',
                'lead_id',
                'lead_customer_id'
            ]);
        });
    }
};
