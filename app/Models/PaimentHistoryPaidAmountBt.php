<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaimentHistoryPaidAmountBt extends Model
{
    use HasFactory;
    protected $fillable = [
        'paid_amount',
        'utr_number',
        'utr_date',
        'bank_name',
        'payment_history_id',
        'created_by'
    ];


    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
    */
    public function attachments()
    {
        return $this->hasMany(PaymentHistoryAttachmentBt::class, 'payment_history_id');
    }

}
