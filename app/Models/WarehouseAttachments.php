<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WarehouseAttachments extends Model
{
    use HasFactory;

    protected $table = "warehouse_attachments";
    protected $fillable = ['inward_id', 'name', 'attachment_type', 'attachment_details', 'created_by', 'created_at', 'updated_at'];

}
