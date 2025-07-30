<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IrmAttachments extends Model
{
    use HasFactory;

    protected $fillable = [
        'irm_id',
        'name',
        'attachment_type',
        'attachment_details',
        'created_by'
    ];
}
