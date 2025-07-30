<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LocationDetail extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'location_details';

    protected $fillable = [
        'warehouse_name',
        'rack_number',
        'floor',
        'is_empty',
        'is_active'
    ];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = ['deleted_at'];

    public function box_details(){
        return $this->hasMany(WarehouseBoxDetails::class, 'location_detail_id');
    }
}
