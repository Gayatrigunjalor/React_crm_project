<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserCompaniesPermissions extends Model
{
    use HasFactory;
    public $timestamps = false;
    protected $fillable = ['user_id', 'company_id'];
}
