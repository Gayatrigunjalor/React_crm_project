<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Credentials extends Model
{
    use HasFactory;
    protected $fillable = [
        'cred_id',
        'website_name',
        'website_fxn',
        'username',
        'email_regd',
        'phone_regd',
        'mfa_by',
        'subscription_type',
        'purchase_date',
        'renew_date',
        'assigned_to_emp',
        'assigned_date',
        'created_by'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function createdName()
    {
        return $this->belongsTo(Employee::class, 'created_by', 'user_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function assigned_to_employee()
    {
        return $this->belongsTo(Employee::class, 'assigned_to_emp', 'id');
    }
}
