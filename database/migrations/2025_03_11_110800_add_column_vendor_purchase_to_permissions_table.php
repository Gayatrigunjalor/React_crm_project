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
        Schema::table('permissions', function (Blueprint $table) {
            $table->boolean('vendor_purchase_list')->nullable()->after('warehouse_delete');
            $table->boolean('vendor_purchase_create')->nullable()->after('vendor_purchase_list');
            $table->boolean('vendor_purchase_edit')->nullable()->after('vendor_purchase_create');
            $table->boolean('vendor_purchase_delete')->nullable()->after('vendor_purchase_edit');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn('vendor_purchase_list');
            $table->dropColumn('vendor_purchase_create');
            $table->dropColumn('vendor_purchase_edit');
            $table->dropColumn('vendor_purchase_delete');
        });
    }
};

DB::table('permissions')->insert(
    array(
        'user_id' => '1',
        'vendor_purchase_list' => true,
        'vendor_purchase_create' => true,
        'vendor_purchase_edit' => true,
        'vendor_purchase_delete' => true
    )
);
