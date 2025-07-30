<?php

use Illuminate\Database\Migrations\Migration;
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
        // Check if the role with id = 2 and name 'SDE-Manger' already exists
        if (!DB::table('roles')->where('id', 2)->exists()) {
            DB::table('roles')->insert([
                'id' => 2,
                'name' => 'SDE-Manger',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Update the role name from 'SDE-Manger' to 'SDE-Manager' (in case there are any typos)
        DB::table('roles')
            ->where('name', 'SDE-Manger')
            ->update(['name' => 'SDE-Manager']);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        // Revert the role name back to 'SDE-Manger'
        DB::table('roles')
            ->where('name', 'SDE-Manager')
            ->update(['name' => 'SDE-Manger']);

        // Optionally, delete the role with id = 2
        DB::table('roles')
            ->where('id', 2)
            ->delete();
    }
};
