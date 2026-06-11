<?php

namespace App\Models;

use App\Traits\HasAdvancedFilter;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasUuids, SoftDeletes, HasAdvancedFilter;

    protected $fillable = [
        'employee_number',
        'full_name_ar',
        'full_name_en',
        'email',
        'phone',
        'password',
        'office_id',
        'department_id',
        'role_id',
        'manager_id',
        'job_title_ar',
        'job_title_en',
        'avatar',
        'status',
        'locale',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
    ];

    protected array $filterable = [
        'full_name_ar', 'full_name_en', 'email', 'employee_number',
        'office_id', 'department_id', 'role_id', 'manager_id', 'status',
    ];

    protected array $sortable = [
        'full_name_ar', 'employee_number', 'email', 'created_at', 'status',
    ];

    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims(): array
    {
        return [
            'role' => $this->role?->name,
            'office_id' => $this->office_id,
            'department_id' => $this->department_id,
        ];
    }

    public function office(): BelongsTo
    {
        return $this->belongsTo(Office::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function subordinates(): HasMany
    {
        return $this->hasMany(User::class, 'manager_id');
    }

    public function sentDocuments(): HasMany
    {
        return $this->hasMany(OfficialDocument::class, 'sender_id');
    }

    public function receivedDocuments(): HasMany
    {
        return $this->hasMany(OfficialDocument::class, 'receiver_id');
    }

    public function chatRooms()
    {
        return $this->belongsToMany(ChatRoom::class, 'chat_room_user')
            ->withPivot('last_read_at', 'is_muted')
            ->withTimestamps();
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function documentTrails(): HasMany
    {
        return $this->hasMany(DocumentTrail::class);
    }

    public function isSupervisor(): bool
    {
        return $this->role?->name === Role::SUPERVISOR;
    }

    public function isGeneralManager(): bool
    {
        return $this->role?->name === Role::GENERAL_MANAGER;
    }

    public function isDepartmentManager(): bool
    {
        return $this->role?->name === Role::DEPARTMENT_MANAGER;
    }

    public function isEmployee(): bool
    {
        return $this->role?->name === Role::EMPLOYEE;
    }

    public function canManageOffice(string $officeId): bool
    {
        if ($this->isSupervisor()) return true;
        return $this->isGeneralManager() && $this->office_id === $officeId;
    }

    public function canManageDepartment(string $departmentId): bool
    {
        if ($this->isSupervisor()) return true;
        if ($this->isGeneralManager()) {
            return $this->department->office_id === $this->office_id;
        }
        return $this->isDepartmentManager() && $this->department_id === $departmentId;
    }
}
