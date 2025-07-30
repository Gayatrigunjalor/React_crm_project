<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PmAttachmentBt extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'attachment_name',
        'attachment_details',
        'business_task_id',
        'created_by'
    ];
}
