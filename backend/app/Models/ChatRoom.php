<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChatRoom extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'type',
        'name_ar',
        'name_en',
        'office_id',
        'department_id',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function office(): BelongsTo
    {
        return $this->belongsTo(Office::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'chat_room_user')
            ->withPivot('last_read_at', 'is_muted')
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function scopeDepartmentChat($query, string $departmentId)
    {
        return $query->where('type', 'department')->where('department_id', $departmentId);
    }

    public function scopeOfficeChat($query, string $officeId)
    {
        return $query->where('type', 'office')->where('office_id', $officeId);
    }

    public function scopeTopManagement($query)
    {
        return $query->where('type', 'top_management');
    }
}
