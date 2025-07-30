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
        Schema::create('credentials_history', function (Blueprint $table) {
            $table->id();
            $table->integer('credential_id');
            $table->integer('employee_id');
            $table->date('assigned_on');
            $table->date('handover_date')->nullable();;
            $table->text('remarks')->nullable();;
            $table->unsignedBigInteger('created_by')->nullable();
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
        Schema::dropIfExists('credentials_history');
    }
};
