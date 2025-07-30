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
        Schema::table('inquiry_receives', function (Blueprint $table) {
            $table->string('target_price')->change();
            $table->string('no_of_product_vendor')->nullable()->after('target_price');
            $table->string('product_code')->nullable()->after('no_of_product_vendor');
            $table->tinyInteger('isRequired')->nullable()->default(0)->after('message');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inquiry_receives', function (Blueprint $table) {
            $table->decimal('target_price', 10, 2)->change();
            $table->dropColumn('no_of_product_vendor');
            $table->dropColumn('product_code');
            $table->dropColumn('isRequired');
        });
    }
};
