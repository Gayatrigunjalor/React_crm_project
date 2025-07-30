<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductVendor extends Model
{
    use HasFactory;
    protected $fillable = [
        'purchase_price',
        'vendor_id',
        'product_id',
        'gst',
        'gst_amount',
        'total_amount',
        'shipping_charges',
        'packaging_charges',
        'other_charges',
        'remark',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function vendor_name()
    {
        return $this->belongsTo(Vendor::class, 'vendor_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function gstPercent()
    {
        return $this->belongsTo(GstPercent::class, 'gst', 'id');
    }
}
