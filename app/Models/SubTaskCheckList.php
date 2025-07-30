<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubTaskCheckList extends Model
{
    use HasFactory;
    protected $fillable = [
        'checklist', 'status','sub_task_id','created_by'
    ];
}
