<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PO_Quotation_AttachmentModel extends Model
{
    use HasFactory;
    protected $table = 'po_quotation_attachments';
    
    protected $fillable = [
        'po_id',
        'name',
        'attachment_type',
        'attachment_details',
        'created_by',
        'created_at',
        'updated_at'
    ];
}
