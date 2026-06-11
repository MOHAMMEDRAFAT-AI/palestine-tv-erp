<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentTrail extends Model
{
    use HasUuids;

    protected $fillable = [
        'document_id',
        'user_id',
        'action',
        'notes',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'json',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(OfficialDocument::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
