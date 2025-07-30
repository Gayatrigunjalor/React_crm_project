<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorPurchaseInvoice extends Model
{
    use HasFactory;
    protected $table = 'vendor_purchase_invoice';
    protected $fillable = [
        'purchase_order_id',
        'purchase_invoice_no',
        'purchase_invoice_date',
        'business_task_id',
        'vendor_id',
        'base_amount',
        'gst_percent',
        'gst_amount',
        'tds_deduction',
        'tds_amount',
        'net_payable',
        'paid_amount',
        'bank_name',
        'utr_number',
        'utr_date',
        'created_by',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function purchase_order() {
        return $this->hasOne(PurchaseOrder::class, 'id', 'purchase_order_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function vendor()
    {
        return $this->belongsTo(Vendor::class, 'vendor_id', 'id');
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function business_task()
    {
        return $this->belongsTo(BusinessTask::class, 'business_task_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\hasMany
     */
    public function attachments()
    {
        return $this->hasMany(VendorPurchaseInvoiceAttachments::class, 'vendor_pi_id', 'id');
    }
}
