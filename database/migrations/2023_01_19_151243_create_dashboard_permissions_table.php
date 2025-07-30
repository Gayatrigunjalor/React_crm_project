<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('dashboard_permissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->unique();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->boolean('cns')->default(0);
            $table->boolean('click_up')->default(0);
            $table->boolean('logistics')->default(0);
            $table->boolean('business_task')->default(0);
            $table->boolean('employee_database')->default(0);
            $table->boolean('assets_credentials')->default(0);
            $table->boolean('procurement')->default(0);
            $table->boolean('recruitment')->default(0);
            $table->boolean('bt_timeline')->default(0);
            $table->boolean('edoc_timeline')->default(0);
            $table->boolean('wms_reporting')->default(0);
            $table->boolean('wms_dashboard')->default(0);
            $table->boolean('roles_responsibility')->default(0);
            $table->boolean('itc_view')->default(0);
            $table->boolean('sb_knock_off')->default(0);
            $table->boolean('ffd_payment_view')->default(0);
            $table->boolean('vendor_payment_view')->default(0);
            $table->timestamps();
        });

        DB::table('dashboard_permissions')->insert(
            array(
                'user_id' => '1',
                'cns'                  => true,
                'click_up'             => true,
                'logistics'            => true,
                'business_task'        => true,
                'employee_database'    => true,
                'assets_credentials'   => true,
                'procurement'          => true,
                'recruitment'          => true,
                'bt_timeline'          => true,
                'edoc_timeline'        => true,
                'wms_reporting'        => true,
                'wms_dashboard'        => true,
                'roles_responsibility' => true,
                'itc_view'             => true,
                'sb_knock_off'         => true,
                'ffd_payment_view'     => true,
                'vendor_payment_view'  => true,
            )
        );
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('dashboard_permissions');
    }
};
