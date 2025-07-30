<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcAttachmentBt extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'attachment_name',
        'attachment_details',
        'supplier_scrutiny_id',
        'created_by'
    ];
}
