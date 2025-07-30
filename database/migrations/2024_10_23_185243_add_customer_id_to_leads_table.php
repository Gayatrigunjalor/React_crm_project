<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->unsignedBigInteger('customer_id')->nullable(); // Add nullable if not all leads have a customer
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('cascade'); // Foreign key relationship
        });
    }
    
    public function down()
    {
        Schema::table('leads', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
            $table->dropColumn('customer_id');
        });
    }
    
};
