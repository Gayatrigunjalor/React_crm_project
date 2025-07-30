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
        Schema::table('lead_customers', function (Blueprint $table) {
            $table->string('country')->nullable()->after('sender_country_iso');
            $table->string('upload_wishing_card')->nullable()->after('country');
            $table->string('business_licence')->nullable()->after('upload_wishing_card');
            $table->string('owner_national_id')->nullable()->after('business_licence');
            $table->string('visiting_card')->nullable()->after('owner_national_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lead_customers', function (Blueprint $table) {
            $table->dropColumn([
                'country',
                'upload_wishing_card',
                'business_licence',
                'owner_national_id',
                'visiting_card',
            ]);
        });
    }
};
