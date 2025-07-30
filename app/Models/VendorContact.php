<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorContact extends Model
{
    use HasFactory;
    protected $fillable = [
        'contact_person',
        'email',
        'designation',
        'mobile',
        'phone',
        'vendor_id',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved'
    ];
}
