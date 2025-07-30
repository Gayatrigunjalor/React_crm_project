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
        Schema::create('ffd_contacts', function (Blueprint $table) {
            $table->id();
            $table->string('phone');
            $table->string('contact_person');
            $table->string('designation')->nullable();
            $table->string('email');
            $table->unsignedBigInteger('ffd_id')->nullable();
            $table->foreign('ffd_id')->references('id')->on('ffds');
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
        Schema::dropIfExists('ffd_contacts');
    }
};
