<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentHistoryAttachmentBt extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'attachment_name',
        'attachment_details',
        'payment_history_id',
        'created_by'
    ];
}
