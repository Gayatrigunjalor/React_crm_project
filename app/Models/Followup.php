<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FollowUp extends Model
{
    use HasFactory;

    protected $fillable = ['status'];

   
    public function details()
    {
        return $this->hasMany(FollowUpDetail::class);
    }
}
