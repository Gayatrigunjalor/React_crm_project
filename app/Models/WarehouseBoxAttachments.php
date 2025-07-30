<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WarehouseBoxAttachments extends Model
{
    use HasFactory;

    protected $table = "warehouse_box_attachments";
    protected $fillable = ['warehouse_box_id', 'name', 'attachment_type', 'attachment_details', 'created_by', 'created_at', 'updated_at'];

}
