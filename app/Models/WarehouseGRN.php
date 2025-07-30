<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WarehouseGRN extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'warehouse_grns';

    protected $fillable = ['inward_id', 'grn_number', 'purchase_order_id', 'vendor_tax_invoice_number', 'vendor_tax_invoice_date', 'vendor_tax_invoice_attachment'];

    public function getLatestGrnId() {
        $grn = $this->orderBy('id','DESC')->withTrashed()->first();
        if($grn){
            $grn_id = $grn->id + 1;
            return $grn_id;
        }
        else
        return 1;
    }

    public function purchase_order(){
        return $this->hasOne(PurchaseOrder::class, 'id', 'purchase_order_id');
    }

    public function boxes(){
        return $this->hasMany(WarehouseBoxDetails::class, 'grn_sys_id', 'id');
    }
}
