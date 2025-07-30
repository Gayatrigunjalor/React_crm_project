<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentHistoryBt extends Model
{
    use HasFactory;
    protected $fillable = [
        'po_id',
        'po_invoice_number',
        'po_invoice_amount',
        'paid_amount',
        'balance_amount',
        'business_task_id',
        'tds_amount',
        'tds_rate',
        'gst_rate',
        'gst_amount',
        'gst_type',
        'bank_name',
        'utr_number',
        'utr_date',
        'created_by'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function histories()
    {
        return $this->hasMany(PaimentHistoryPaidAmountBt::class, 'payment_history_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function po_details()
    {
        return $this->hasOne(PurchaseOrder::class, 'id', 'po_id');
    }
}
