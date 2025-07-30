<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WarehouseOutward extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'warehouse_outward';

    protected $fillable = [
        'outward_sys_id',
        'inward_id',
        'outward_date',
        'invoice_id',
        'eway_bill_number',
        'eway_bill_date',
        'eway_bill_attachment',
        'created_by'
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

    public function inward() {
        return $this->belongsTo(Warehouse::class, 'inward_id');
    }

    public function invoice() {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }
}
