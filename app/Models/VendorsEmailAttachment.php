<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorsEmailAttachment extends Model
{
    use HasFactory;
    protected $table = 'inv_vendors_email_attachments';
    protected $fillable = [
        'invoice_id',
        'attachment_name',
    ];
}
