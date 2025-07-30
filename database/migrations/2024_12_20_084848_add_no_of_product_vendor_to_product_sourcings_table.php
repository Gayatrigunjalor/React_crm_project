<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNoOfProductVendorToProductSourcingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('product_sourcings', function (Blueprint $table) {
            $table->integer('no_of_product_vendor')->nullable()->after('procurement_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('product_sourcings', function (Blueprint $table) {
            $table->dropColumn('no_of_product_vendor');
        });
    }
}
