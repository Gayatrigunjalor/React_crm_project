<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stage extends Model
{
    use HasFactory;
    protected $fillable = [
        'stage_name', 'stage_order', 'stage_bg_color', 'is_done_stage'
    ];
}
