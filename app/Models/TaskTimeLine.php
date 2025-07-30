<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskTimeLine extends Model
{
    use HasFactory;
    protected $fillable = [
        'description',
        'task_id',
        'created_by'
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function attachments()
    {
        return $this->hasMany(CommentAttachment::class, 'comment_id', 'id');
    }
}
