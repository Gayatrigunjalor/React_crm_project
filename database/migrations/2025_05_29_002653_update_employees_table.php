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
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn(['kpiRole','ancillary_role_id']);
            $table->unsignedBigInteger('leadership_kpi_id')->nullable()->after('is_click_up_on');
            $table->foreign('leadership_kpi_id')->references('id')->on('roles')->onDelete('cascade');
            $table->text('ancillary_roles')->nullable()->after('leadership_kpi_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['leadership_kpi_id']);
            $table->string('kpiRole')->nullable()->after('is_click_up_on')->default(null);
            $table->bigInteger('ancillary_role_id')->nullable()->after('kpiRole')->default(null);
            $table->dropColumn(['leadership_kpi_id', 'ancillary_roles']);
        });
    }
};
