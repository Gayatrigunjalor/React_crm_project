<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FircAttachment extends Model
{
    use HasFactory;
    protected $table = 'inv_firc_attachments';
    protected $fillable = [
        'invoice_id',
        'attachment_name',
    ];
}
