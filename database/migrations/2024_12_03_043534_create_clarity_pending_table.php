<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateClarityPendingTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('clarity_pending', function (Blueprint $table) {
            $table->id(); // Auto-incrementing ID
            $table->string('status_mode')->nullable(); // Status mode (nullable, can store text)
            $table->longText('clarity_pending')->nullable(); // Clarity pending (nullable, can store text)
            $table->timestamps(); // Timestamps for created_at and updated_at
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('clarity_pending');
    }
}
