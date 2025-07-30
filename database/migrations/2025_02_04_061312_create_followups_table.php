<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('lead_followups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lead_id')->constrained('leads')->onDelete('cascade');
            $table->foreignId('customer_id')->constrained('lead_customers')->onDelete('cascade');
            $table->text('message');
            $table->integer('attempt');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('lead_followups');
    }
};

