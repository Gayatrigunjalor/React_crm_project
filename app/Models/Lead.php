<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    use HasFactory;
   
    protected $table = 'leads';

    // Fillable fields for mass assignment
    protected $fillable = [
        'unique_query_id',
        'customer_id',
        'query_type',
        'query_time',
        'sender_name',
        'sender_mobile',
        'sender_email',
        'sender_company',
        'sender_address',
        'sender_city',
        'sender_state',
        'sender_pincode',
        'sender_country_iso',
        'sender_mobile_alt',
        'sender_email_alt',
        'query_product_name',
        'query_message',
        'query_mcat_name',
        'call_duration',
        'receiver_mobile',
        'platform',
        'qualified',
        'disqualified',
        'product_quantity',
        'purchase_time_frame',
        'salesperson_id',
        'price',
        'is_agent_qualified_lead'

    ];
   
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    // In Lead.php (Lead model)
public function sender()
{
    return $this->belongsTo(Customer::class, 'sender_mobile', 'sender_mobile');
}
   public function customer_lead()
    {
        return $this->belongsTo(Lead_customer::class, 'customer_id', 'id');
    }


    public function inquiryReceive()
    {
        return $this->hasOne(InquiryReceive::class, 'lead_id', 'id');
    }

    public function leadAcknowledgment()
    {
        return $this->hasOne(LeadAcknowledgment::class);
    }

    public function productSourcing()
    {
        return $this->hasOne(ProductSourcing::class);
    }

    public function priceShared()
    {
        return $this->hasOne(PriceShared::class);
    }

    public function quotation()
    {
        return $this->hasOne(QuotationSent::class);
    }

    public function followUpDetail()
    {
        return $this->hasOne(FollowUpDetail::class);
    }

    public function victory()
    {
        return $this->hasOne(Victory::class);
    }
}

