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
        Schema::table('payment_history_bts', function (Blueprint $table) {
            $table->bigInteger('business_task_id')->unsigned()->nullable()->change();
            $table->string('bank_name')->after('gst_type')->nullable();
            $table->string('utr_number')->after('bank_name')->nullable();
            $table->string('utr_date')->after('utr_number')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payment_history_bts', function (Blueprint $table) {
            $table->dropColumn('bank_name');
            $table->dropColumn('utr_number');
            $table->dropColumn('utr_date');
        });
    }
};
