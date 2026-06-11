<?php

namespace App\Models;

use App\Traits\HasAdvancedFilter;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use HasUuids, SoftDeletes, HasAdvancedFilter;

    protected $fillable = [
        'office_id',
        'name_ar',
        'name_en',
        'code',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected array $filterable = ['name_ar', 'name_en', 'code', 'office_id', 'is_active'];

    protected array $sortable = ['name_ar', 'code', 'created_at'];

    public function office(): BelongsTo
    {
        return $this->belongsTo(Office::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function manager(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(User::class)->whereHas('role', function ($q) {
            $q->where('name', 'department_manager');
        });
    }

    public function chatRooms(): HasMany
    {
        return $this->hasMany(ChatRoom::class);
    }
}
