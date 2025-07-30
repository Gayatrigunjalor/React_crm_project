<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class ProfarmaInvoiceAttachment extends Model
{
    use HasFactory;
    protected $table = 'inv_profarma_invoice_attachments';
    protected $fillable = [
        'invoice_id',
        'attachment_name',
    ];
}
