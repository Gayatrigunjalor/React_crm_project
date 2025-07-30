<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LegalContractAttachment extends Model
{
    use HasFactory;
    protected $table = 'inv_legal_contract_attachments';
    protected $fillable = [
        'invoice_id',
        'attachment_name',
    ];
}
