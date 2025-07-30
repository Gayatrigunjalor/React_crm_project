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
        Schema::create('bank_details', function (Blueprint $table) {
            $table->id();
            $table->string('bank_name');
            $table->string('account_holder_name');
            $table->string('address');
            $table->string('branch');
            $table->string('branch_code');
            $table->string('account_no');
            $table->string('ifsc');
            $table->timestamps();
        });

        DB::table('bank_details')->insert(
            array(
                'id' => 1,
                'bank_name' => 'Inorbvict Vortex',
                'account_holder_name' => 'Inorbvict Vortex',
                'address' => 'Inorbvict Vortex',
                'branch' => 'Inorbvict Vortex',
                'branch_code' => 'Inorbvict Vortex',
                'account_no' => 'Inorbvict Vortex',
                'ifsc' => 'Inorbvict Vortex'
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
        Schema::dropIfExists('bank_details');
    }
};
