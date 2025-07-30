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
        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->string('customer_name');
            $table->string('lead_stage');
            $table->string('meeting_agenda');
            $table->string('link')->nullable();
            $table->date('date_time');
            $table->time('start_time');
            $table->time('end_time');
            $table->text('description')->nullable();
            $table->enum('status', ['progress', 'done'])->default('progress');
            $table->timestamps();
        });
    }
    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};
