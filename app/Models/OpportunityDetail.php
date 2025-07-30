<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpportunityDetail extends Model
{
    use HasFactory;

    protected $table = 'opportunity_details';

    protected $fillable = [
        'lead_id',
        'cust_id',
        'buying_plan',
        'attachment',
        'name',
        'mo_no',
        'email',
        'customer_specific_need',
        'inorbvict_commitment',
        'remark',
        'key_opportunity',
        'extra_chatboat_notes',
        'lead_ack_status',
        'order_value'
    ];

    
    public function attachments()
    {
        return $this->hasMany(OpportunityAttachment::class, 'opportunity_id');
    }

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function lead()
    {
        return $this->belongsTo(Lead::class, 'lead_id', 'id');
    }
}
