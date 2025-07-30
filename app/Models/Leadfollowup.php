<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leadfollowup extends Model
{
    use HasFactory;

    protected $fillable = ['lead_id', 'customer_id', 'message', 'attempt'];
}
