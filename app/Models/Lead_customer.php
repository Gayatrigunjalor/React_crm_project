<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead_customer extends Model
{
    use HasFactory;
    protected $table = 'lead_customers';

    // Fillable fields for mass assignment
    protected $fillable = [
        'sender_name',
        'sender_mobile',
        'sender_email',
        'sender_company',
        'sender_address',
        'sender_city',
        'sender_state',
        'sender_pincode',
        'sender_country_iso',
        'customer_status',
        'country_status',
        'designation',
        'company_name',
        'communication_via',
        'specialty_industry_sector',
        'website',
        'country',
        'upload_wishing_card',
        'business_licence',
        'owner_national_id',
        'visiting_card'

       
    ];
    public function leads()
    {
        return $this->hasMany(Lead::class);
    }
}
