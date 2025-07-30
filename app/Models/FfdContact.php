<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FfdContact extends Model
{
    use HasFactory;
    protected $fillable = [
        'phone',
        'contact_person',
        'designation',
        'email',
        'ffd_id'
    ];
}
