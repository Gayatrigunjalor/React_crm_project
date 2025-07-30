<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WarehouseBoxDetails extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'warehouse_box_details';

    protected $fillable = [
        'inward_id',
        'grn_sys_id',
        'box_sys_id',
        'purchase_order_id',
        'location_detail_id',
        'net_weight',
        'gross_weight',
        'length',
        'width',
        'height',
        'box_packaging_date',
        'box_packaging_done',
        'box_inspection_done',
        'box_inspection_by',
        'box_packaging_remark'
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

    public function purchase_order_details() {
        return $this->hasOne(PurchaseOrder::class, 'id', 'purchase_order_id');
    }

    public function location_details() {
        return $this->hasOne(LocationDetail::class, 'id', 'location_detail_id');
    }

    public function grn_number() {
        return $this->belongsTo(WarehouseGRN::class, 'grn_sys_id');
    }

    public function inward_details() {
        return $this->hasOne(Warehouse::class, 'id', 'inward_id');
    }

    public function box_attachments_product() {
        return $this->hasMany(WarehouseBoxAttachments::class, 'warehouse_box_id', 'id')->where('attachment_type','product_image');
    }

    public function box_attachments() {
        return $this->hasMany(WarehouseBoxAttachments::class, 'warehouse_box_id', 'id')->whereNot('attachment_type','product_image');
    }

    public function products() {
        return $this->hasMany(WarehouseBoxProducts::class, 'warehouse_box_id', 'id');
    }
}
