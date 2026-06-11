<?php

namespace App\Models;

use App\Traits\HasAdvancedFilter;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasUuids, HasAdvancedFilter;

    protected $fillable = [
        'user_id',
        'action',
        'description_ar',
        'description_en',
        'entity_type',
        'entity_id',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
        'method',
        'route',
    ];

    protected $casts = [
        'old_values' => 'json',
        'new_values' => 'json',
    ];

    protected array $filterable = [
        'user_id', 'action', 'entity_type', 'ip_address', 'created_at',
    ];

    protected array $sortable = ['created_at', 'action'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function log(array $data): self
    {
        return static::create(array_merge([
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'method' => request()->method(),
            'route' => request()->path(),
        ], $data));
    }
}
