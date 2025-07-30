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
        Schema::table('employees', function (Blueprint $table) {
            $table->bigInteger('ancillary_role_id')->nullable()->after('kpiRole')->default(null);
        });

        $employees = DB::table('employees')->select('id','role_id')->get();
        foreach($employees as $emp){
            DB::table('employees')->where('id', $emp->id)->update(['ancillary_role_id' => $emp->role_id]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('ancillary_role_id');
        });
    }
};
