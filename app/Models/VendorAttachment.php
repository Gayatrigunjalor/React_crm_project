<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VendorAttachment extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'attachment_name',
        'details',
        'vendor_id',
        'created_by',
        'rejected_by',
        'rejected',
        'checker_id',
        'approved'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function attachment()
    {
        return $this->belongsTo(Attachment::class, 'attachment_name', 'id');
    }
}
