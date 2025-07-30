<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IrmPaymentHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'irm_id',
        'received_amount',
        'outstanding_amount',
        'invoice_amount',
        'invoice_id',
        'reference_no',
        'remittance_date',
        'currency_id',
        'buyer_id',
        'consignee_id',
        'old_outstanding_amount'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function invoiceDetails()
    {
        return $this->belongsTo(Invoice::class, 'invoice_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function currency()
    {
        return $this->belongsTo(Currency::class, 'currency_id', 'id');
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function buyer()
    {
        return $this->belongsTo(Customer::class, 'buyer_id', 'id');
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function consignee()
    {
        return $this->belongsTo(Consignee::class, 'consignee_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function bank()
    {
        return $this->belongsTo(BankAccount::class, 'bank_id', 'id');
    }
}
