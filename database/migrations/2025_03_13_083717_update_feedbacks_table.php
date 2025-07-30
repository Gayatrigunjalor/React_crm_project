<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('feedbacks', function (Blueprint $table) {
            $table->dropColumn('user_id'); // Remove user_id
            $table->unsignedBigInteger('lead_id')->nullable()->after('id');
            $table->unsignedBigInteger('customer_id')->nullable()->after('lead_id');
        });
    }

    public function down(): void
    {
        Schema::table('feedbacks', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable();
            $table->dropColumn(['lead_id', 'customer_id']);
        });
    }
};
