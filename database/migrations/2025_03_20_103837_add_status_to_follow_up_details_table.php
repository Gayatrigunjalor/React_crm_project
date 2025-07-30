<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('follow_up_details', function (Blueprint $table) {
            $table->string('status')->after('data');
        });
    }

    public function down(): void
    {
        Schema::table('follow_up_details', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};
