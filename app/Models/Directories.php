<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Directories extends Model
{
    use HasFactory;
    protected $fillable = [
        'company_name',
        'services',
        'address',
        'brand_name',
        'company_email',
        'website',
        'current_status',
        'business_card',
        'any_disputes',
        'contact_person',
        'designation',
        'contact_number',
        'email',
        'alternate_contact_number',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'collaboration_interest',
        'approved'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function createdName()
    {
        return $this->belongsTo(Employee::class, 'created_by', 'user_id');
    }
}
