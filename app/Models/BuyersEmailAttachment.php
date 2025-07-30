<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BuyersEmailAttachment extends Model
{
    use HasFactory;
    protected $table = 'inv_buyers_email_attachments';
    protected $fillable = [
        'invoice_id',
        'attachment_name',
    ];
}
