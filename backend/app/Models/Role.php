<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'label_ar',
        'label_en',
        'level',
        'description',
    ];

    protected $casts = [
        'level' => 'integer',
    ];

    public const SUPERVISOR = 'supervisor';          // المستوى 1
    public const GENERAL_MANAGER = 'general_manager';  // المستوى 2
    public const DEPARTMENT_MANAGER = 'department_manager'; // المستوى 3
    public const EMPLOYEE = 'employee';               // المستوى 4

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_permission');
    }

    public function hasPermission(string $permissionName): bool
    {
        return $this->permissions()->where('name', $permissionName)->exists();
    }
}
