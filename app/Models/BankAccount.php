<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BankAccount extends Model
{
    use HasFactory;
    protected $fillable = [
        'bank_name',
        'account_holder_name',
        'address',
        'branch',
        'branch_code',
        'account_no',
        'ifsc',
        'city',
        'pin_code',
        'swift_code',
        'ad_code',
        'pi_preference'
    ];
}
