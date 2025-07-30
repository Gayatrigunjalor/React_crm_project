<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InquiryReceive extends Model
{
    use HasFactory;

    // Define the table name
    protected $table = 'inquiry_receives';

    // Define the primary key (if it's not 'id')
    // Define the fillable attributes for mass assignment
    protected $fillable = [
        'customer_id',
        'lead_id',
        'status',
        'product',
        'model',
        'make',
        'quantity',
        'target_price',
        'no_of_product_vendor',
        'product_code'
      
    ];

    // If you have timestamps (created_at and updated_at) in your table
    public $timestamps = true;

    // Optional: Define relationships if needed
    public function customer()
    {
        return $this->belongsTo(Lead_customer::class); // Assuming a relationship with a Customer model
    }

    public function lead()
    {
        return $this->belongsTo(Lead::class); // Assuming a relationship with a Lead model
    }
}
