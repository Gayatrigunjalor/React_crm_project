<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
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
        Schema::create('bank_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('bank_name');
            $table->string('account_holder_name');
            $table->string('address');
            $table->string('branch');
            $table->string('branch_code');
            $table->string('account_no');
            $table->string('ifsc');
            $table->string('city');
            $table->string('pin_code');
            $table->string('swift_code');
            $table->string('ad_code');
            $table->tinyInteger('pi_preference')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('bank_accounts');
    }
};
