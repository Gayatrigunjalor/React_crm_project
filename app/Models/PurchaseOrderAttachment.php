<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class PurchaseOrderAttachment extends Model
{
    use HasFactory;
    protected $table = 'inv_purchase_order_attachments';
    protected $fillable = [
        'invoice_id',
        'attachment_name',
    ];
}
