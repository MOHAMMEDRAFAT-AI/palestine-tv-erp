<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'chat_room_id',
        'sender_id',
        'body',
        'type',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
    ];

    public function chatRoom(): BelongsTo
    {
        return $this->belongsTo(ChatRoom::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function reads()
    {
        return $this->belongsToMany(User::class, 'message_reads')
            ->withPivot('read_at')
            ->withTimestamps();
    }

    public function isReadBy(string $userId): bool
    {
        return $this->reads()->where('user_id', $userId)->exists();
    }
}
