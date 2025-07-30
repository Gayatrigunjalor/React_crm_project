<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommentAttachmentSubtask extends Model
{
    use HasFactory;

    protected $fillable = [
        'comment_id',
        'image',
    ];
}
