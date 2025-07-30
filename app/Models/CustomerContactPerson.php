<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CustomerContactPerson extends Model
{
    use HasFactory;


    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'customer_contact_persons';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'lead_id',
        'lead_cust_id',
        'contact_person_name',
        'city',
        'country',
        'mobile_no',
        'address',
        'pincode',
        'state',
        'email',
        'designation',
    ];

    /**
     * Relationships
     */

    // Link to the Lead
    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    // Link to the Lead Customer
    public function leadCustomer()
    {
        return $this->belongsTo(Lead_customer::class, 'lead_cust_id');
    }

}
