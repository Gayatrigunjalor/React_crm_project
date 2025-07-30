<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcurementAttachment extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'attachment_name',
        'details',
        'procurement_id',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved'
    ];
}
