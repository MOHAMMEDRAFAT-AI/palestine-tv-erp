<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'label_ar',
        'label_en',
        'group',
        'description',
    ];

    public const DOCUMENTS = 'documents';
    public const USERS = 'users';
    public const CHAT = 'chat';
    public const REPORTS = 'reports';
    public const SETTINGS = 'settings';

    // Document permissions
    public const DOCUMENT_CREATE = 'documents.create';
    public const DOCUMENT_SEND = 'documents.send';
    public const DOCUMENT_RECEIVE = 'documents.receive';
    public const DOCUMENT_APPROVE = 'documents.approve';
    public const DOCUMENT_REJECT = 'documents.reject';
    public const DOCUMENT_ARCHIVE = 'documents.archive';
    public const DOCUMENT_VIEW_ALL = 'documents.view_all';

    // User permissions
    public const USER_CREATE = 'users.create';
    public const USER_EDIT = 'users.edit';
    public const USER_DELETE = 'users.delete';
    public const USER_VIEW = 'users.view';

    // Chat permissions
    public const CHAT_SEND = 'chat.send';
    public const CHAT_READ = 'chat.read';
    public const CHAT_MANAGE = 'chat.manage';

    // Report permissions
    public const REPORT_VIEW = 'reports.view';
    public const REPORT_EXPORT = 'reports.export';

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permission');
    }
}
