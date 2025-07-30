<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ffd extends Model
{
    use HasFactory;
    protected $fillable = [
        'ffd_name',
        'ffd_type',
        'ffd_relation',
        'country_id',
        'state_id',
        'address',
        'city',
        'pin_code',
        'website',
    ];

}
