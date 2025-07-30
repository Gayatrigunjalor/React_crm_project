<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ebrc extends Model
{
    use HasFactory;
    protected $fillable = [
        'invoice_id',
        'e_brc_no',
        'e_brc_date',
        'ebrc_certificate',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function invoiceDetails(){
        return $this->belongsTo(Invoice::class,'invoice_id','id');
    }
}
