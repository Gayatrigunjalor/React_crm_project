<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Warehouse extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'warehouse';

    protected $fillable = [
        'inward_sys_id',
        'inward_date',
        'mode_of_shipment',
        'terms_of_shipment',
        'proforma_invoice_id',
        'business_task_id',
        'port_of_loading',
        'port_of_discharge',
        'inco_term_id',
        'pickup_location',
        'outward_date',
        'mark_as_outward',
        'invoice_id',
        'eway_bill_number',
        'packaging_date',
        'packaging_done',
        'packaging_remark',
        'psd_id',
        'psd_date',
        'psd_done',
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

    public function grns(){
        return $this->hasMany(WarehouseGRN::class, 'inward_id');
    }

    public function boxes(){
        return $this->hasMany(WarehouseBoxDetails::class, 'inward_id', 'id');
    }

    public function business_task(){
        return $this->hasOne(BusinessTask::class, 'id', 'business_task_id');
    }

    public function proforma_invoice(){
        return $this->belongsTo(Quotation::class, 'proforma_invoice_id', 'id');
    }

    public function inco_term(){
        return $this->belongsTo(IncoTerm::class, 'inco_term_id', 'id');
    }

    public function invoice(){
        return $this->belongsTo(Invoice::class, 'invoice_id', 'id');
    }

    public function outwards() {
        return $this->hasMany(WarehouseOutward::class, 'inward_id', 'id');
    }

    public function psds() {
        return $this->hasMany(WarehousePSD::class, 'inward_id', 'id');
    }

    public function inward_attachments() {
        return $this->hasMany(WarehouseAttachments::class, 'inward_id', 'id');
    }
}
