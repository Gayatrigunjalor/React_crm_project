<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_name', 
        'lead_stage', 
        'meeting_agenda', 
        'link', 
        'date_time', 
        'start_time', 
        'end_time', 
        'description', 
        'status',
        'reason'
    ];
}
