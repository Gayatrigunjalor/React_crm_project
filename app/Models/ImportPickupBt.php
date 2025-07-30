<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ImportPickupBt extends Model
{
    use HasFactory;
    protected $fillable = [
        'ffd_id',
        'email_id',
        'contact_no',
        'ffd_name',
        'agent_name',
        'kyc_done',
        'pick_up_reference_number',
        'pick_up_booking_date',
        'expected_document_handover',
        'followup_reminder_importer',
        'business_task_id',
        'created_by'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function ffd_name()
    {
        return $this->belongsTo(Ffd::class, 'ffd_id', 'id');
    }
}
