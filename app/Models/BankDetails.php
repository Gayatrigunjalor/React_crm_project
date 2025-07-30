<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankDetails extends Model
{
    use HasFactory;
    protected $fillable = [
        'bank_name',
        'account_holder_name',
        'address',
        'branch',
        'branch_code',
        'account_no',
        'ifsc'
    ];
}
