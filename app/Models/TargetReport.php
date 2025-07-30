<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TargetReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'target_done',
        'target_remaining',
        'reporting_date',
        'target_remaining_old'
    ];
}
