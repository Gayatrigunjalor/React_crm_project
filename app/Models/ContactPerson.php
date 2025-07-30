<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ContactPerson extends Model
{
    use HasFactory;

    protected $table = 'contact_persons';
    protected $fillable = [
        'contact_person',
        'email',
        'mobile',
        'phone',
        'designation',
        'customer_id',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved'
    ];
}
