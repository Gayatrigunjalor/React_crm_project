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
        Schema::create('company_details', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('short_code')->nullable();
            $table->string('address');
            $table->string('city');
            $table->string('state');
            $table->string('pin_code');
            $table->string('gst_no');
            $table->string('pan_no');
            $table->string('pcpndt_no');
            $table->string('drug_lic_no');
            $table->string('iec');
            $table->string('cin');
            $table->string('tds');
            $table->string('iso');
            $table->string('arn');
            $table->string('one_star_export_no', 100)->nullable();
            $table->string('aeo_code', 100)->nullable();
            $table->string('website');
            $table->string('optional_website')->nullable();
            $table->string('mobile');
            $table->string('optional_mobile')->nullable();
            $table->string('country');
            $table->unsignedBigInteger('company_id')->default(1);
            $table->timestamps();
            $table->softDeletes();
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });


        DB::table('company_details')->insert(
            array(
                'id' => 1,
                'name' => 'Inorbvict Vortex',
                'short_code' => 'INORB',
                'address' => 'Hinjewadi, Near Dmart Pune',
                'city' => 'Pune',
                'state' => 'Maharashtra',
                'pin_code' => '441905',
                'gst_no' => '0012',
                'pan_no' => 'PSGN1235',
                'pcpndt_no' => '1234',
                'drug_lic_no' => '8354',
                'iec' => '6326',
                'cin' => '3te78',
                'tds' => '63254',
                'iso' => '087',
                'arn' => '6302',
                'one_star_export_no' => '6302',
                'aeo_code' => '6302',
                'website' => 'www.info@inhpl.com',
                'mobile' => '9083653345',
                'country' => 'India',
                'company_id' => 1
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
        Schema::dropIfExists('company_details');
    }
};
