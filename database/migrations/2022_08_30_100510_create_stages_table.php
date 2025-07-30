<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('stages', function (Blueprint $table) {
            $table->id();
            $table->string('stage_name');
            $table->bigInteger('stage_order');
            $table->string('stage_bg_color',10);
            $table->boolean('is_done_stage')->default(0);
            $table->timestamps();
        });

        DB::table('stages')->insert(
            array(
                [
                    'id' => 2,
                    'stage_name' => 'To Do',
                    'stage_order' => 0,
                    'stage_bg_color' => '#d2d2d2',
                    'is_done_stage' => 0,
                ],
                [
                    'id' => 3,
                    'stage_name' => 'In Progress',
                    'stage_order' => 1,
                    'stage_bg_color' => '#f0f406',
                    'is_done_stage' => 0,
                ],
                [
                    'id' => 4,
                    'stage_name' => 'Hold',
                    'stage_order' => 2,
                    'stage_bg_color' => '#fb00ff',
                    'is_done_stage' => 0,
                ],
                [
                    'id' => 5,
                    'stage_name' => 'Abort',
                    'stage_order' => 3,
                    'stage_bg_color' => '#2b00ff',
                    'is_done_stage' => 0,
                ],
                [
                    'id' => 6,
                    'stage_name' => 'Review',
                    'stage_order' => 4,
                    'stage_bg_color' => '#edc707',
                    'is_done_stage' => 1,
                ],
                [
                    'id' => 7,
                    'stage_name' => 'Complete',
                    'stage_order' => 5,
                    'stage_bg_color' => '#13dc04',
                    'is_done_stage' => 1,
                ],
                [
                    'id' => 8,
                    'stage_name' => 'False Report',
                    'stage_order' => 6,
                    'stage_bg_color' => '#f10404',
                    'is_done_stage' => 0,
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
        Schema::dropIfExists('stages');
    }
};
