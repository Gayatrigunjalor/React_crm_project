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
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        DB::table('roles')->insert(
            array(
                [
                    'id' => 1,
                    'name' => 'ADMIN'
                ],
               
                [
                    'id' => 3,
                    'name' => 'SDE'
                ],
                [
                    'id' => 4,
                    'name' => 'BPE'
                ],
                [
                    'id' => 5,
                    'name' => 'DEO'
                ],
                [
                    'id' => 6,
                    'name' => 'PM'
                ],
                [
                    'id' => 7,
                    'name' => 'LM'
                ],
                [
                    'id' => 9,
                    'name' => 'CM'
                ]
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
        Schema::dropIfExists('roles');
    }
};
