<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;


return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->boolean('lead_list')->nullable()->default(0)->after('warehouse_delete');;
            $table->boolean('lead_create')->nullable()->default(0)->after('lead_list');;
            $table->boolean('lead_edit')->nullable()->default(0)->after('lead_create');;
            $table->boolean('lead_delete')->nullable()->default(0)->after('lead_edit');;
        });
    }


    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('permissions', function (Blueprint $table) {
            $table->dropColumn('lead_list');
            $table->dropColumn('lead_create');
            $table->dropColumn('lead_edit');
            $table->dropColumn('lead_delete');
        });
    }
};

DB::table('permissions')->insert(
    array(
        'user_id' => '1',
        'lead_list' => true,
        'lead_create' => true,
        'lead_edit' => true,
        'lead_delete' => true
    )
);
