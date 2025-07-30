<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubTaskTimeLine extends Model
{
    use HasFactory;

    protected $fillable = [
        'description',
        'sub_task_id',
        'created_by'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function attachments()
    {
        return $this->hasMany(CommentAttachmentSubtask::class, 'comment_id', 'id');
    }
}
