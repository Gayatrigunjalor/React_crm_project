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
        Schema::create('procurement_attachments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('attachment_name');
            $table->string('details');
            $table->foreignId('procurement_id');
            $table->integer('checker_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('rejected_by')->nullable();
            $table->boolean('rejected')->nullable();
            $table->boolean('approved')->nullable();
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
        Schema::dropIfExists('procurement_attachments');
    }
};
