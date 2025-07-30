<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Irm extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'irm_sys_id',
        'reference_no',
        'remittance_date',
        'currency_id',
        'received_amount',
        'outstanding_amount',
        'invoice_amount',
        'invoice_id',
        'bank_id',
        'map_to_trade',
        'buyer_id',
        'consignee_ids',
        'business_task_id',
        'shipment_type',
        'company_id'
    ];

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
        return $this->belongsTo(Consignee::class, 'consignee_ids', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function bank()
    {
        return $this->belongsTo(BankAccount::class, 'bank_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function business_task()
    {
        return $this->belongsTo(BusinessTask::class, 'business_task_id', 'id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function irm_attachments()
    {
        return $this->hasMany(IrmAttachments::class, 'irm_id');
    }
}
