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
        Schema::create('procurement_uploads', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('procurement_id');
            $table->string('name')->nullable();
            $table->string('attachment_type')->nullable();
            $table->string('attachment_details')->nullable();
            $table->integer('created_by')->nullable();
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
        Schema::dropIfExists('procurement_uploads');
    }
};
