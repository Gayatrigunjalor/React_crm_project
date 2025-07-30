<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaxPurchaseAttachment extends Model
{
    use HasFactory;
    protected $table = 'inv_tax_purchase_attachments';
    protected $fillable = [
        'invoice_id',
        'attachment_name',
    ];
}
