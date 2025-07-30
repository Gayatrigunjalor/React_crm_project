<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerConsignee extends Model
{
    use HasFactory;

    // Table name (optional if it matches the class name)
    protected $table = 'customer_consignees';

    // Fillable fields for mass assignment
    protected $fillable = [
        'lead_id',
        'cust_id',
        'contact_person_name',
        'add',
        'city',
        'pincode',
        'country',
        'state',
        'mo_no',
        'email',
        'designation',
    ];

    // Define relationships
    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function customer()
    {
        return $this->belongsTo(Lead_Customer::class, 'lead_cust_id');
    }
}
