<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorPurchaseInvoiceAttachments extends Model
{
    use HasFactory;
    protected $table = 'vendor_purchase_invoice_attachments';
    protected $fillable = [
        'vendor_pi_id',
        'name',
        'attachment_type',
        'attachment_details',
        'created_by',
    ];

    public function getLatestId() {
        $box = $this->orderBy('id','DESC')->withTrashed()->first();
        if($box){
            $box_id = $box->id + 1;
            return $box_id;
        }
        else
        return 1;
    }
}
