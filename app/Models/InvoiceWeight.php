<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceWeight extends Model
{
    use HasFactory;
    protected $fillable = [
        'invoice_id',
        'net_wt',
        'gross_wt',
        'vol_wt',
        'noofboxes',
        'l_wt',
        'b_wt',
        'h_wt'
    ];
}
