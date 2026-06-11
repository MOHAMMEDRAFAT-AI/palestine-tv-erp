<?php

namespace App\Models;

use App\Traits\HasAdvancedFilter;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class OfficialDocument extends Model
{
    use HasUuids, SoftDeletes, HasAdvancedFilter;

    protected $fillable = [
        'document_number',
        'sender_id',
        'receiver_id',
        'office_id',
        'department_id',
        'title',
        'body',
        'priority',
        'status',
        'rejection_reason',
        'sent_at',
        'received_at',
        'completed_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'received_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected array $filterable = [
        'document_number', 'title', 'sender_id', 'receiver_id',
        'office_id', 'department_id', 'priority', 'status',
    ];

    protected array $sortable = [
        'document_number', 'created_at', 'sent_at', 'priority', 'status',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function office(): BelongsTo
    {
        return $this->belongsTo(Office::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(DocumentAttachment::class);
    }

    public function trails(): HasMany
    {
        return $this->hasMany(DocumentTrail::class)->latest();
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isSent(): bool
    {
        return $this->status === 'sent';
    }

    public function isReceived(): bool
    {
        return $this->status === 'received';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isArchived(): bool
    {
        return $this->status === 'archived';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function canBeSent(): bool
    {
        return $this->isDraft();
    }

    public function canBeApproved(): bool
    {
        return in_array($this->status, ['sent', 'received', 'in_progress']);
    }

    public static function generateDocumentNumber(): string
    {
        $year = now()->format('Y');
        $lastDoc = static::whereYear('created_at', $year)
            ->orderBy('created_at', 'desc')
            ->first();

        $sequence = $lastDoc ? (int) explode('-', $lastDoc->document_number)[2] + 1 : 1;

        return sprintf('PTV-%s-%04d', $year, $sequence);
    }
}
