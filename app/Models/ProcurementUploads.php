<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcurementUploads extends Model
{
    use HasFactory;

    protected $table = "procurement_uploads";
    protected $fillable = ['procurement_id', 'name', 'attachment_type', 'attachment_details', 'created_by', 'created_at', 'updated_at'];

}
