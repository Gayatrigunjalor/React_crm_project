<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcurementVendor extends Model
{
    use HasFactory;
    protected $fillable = [
        'vendor_id',
        'procurement_id',
        'procurement_product_id',
        'product_identifying_name',
        'delivery_date',
        'warranty',
        'mfg_year',
        'ready_stock_availability',
        'lead_time',
        'payment_term',
        'product_cost',
        'gst_percent_id',
        'grand_total',
        'transportation_cost',
        'installation_cost',
        'make',
        'model',
        'product_type_id',
        'product_condition_id',
        'expiry_period',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved',
        'attachment_id'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function vendors()
    {
        return $this->belongsTo(Vendor::class, 'vendor_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function procurement_product()
    {
        return $this->belongsTo(ProcurementProducts::class, 'procurement_product_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function procurement_attachments()
    {
        return $this->belongsTo(ProcurementAttachment::class, 'attachment_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function gst_percent()
    {
        return $this->belongsTo(GstPercent::class, 'gst_percent_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product_type()
    {
        return $this->belongsTo(ProductType::class, 'product_type_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product_condition()
    {
        return $this->belongsTo(ProductCondition::class, 'product_condition_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function createdName()
    {
        return $this->belongsTo(Employee::class, 'created_by', 'user_id');
    }
}
