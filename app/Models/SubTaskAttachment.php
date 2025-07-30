<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubTaskAttachment extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'sub_task_id',
        'created_by'
    ];
}
