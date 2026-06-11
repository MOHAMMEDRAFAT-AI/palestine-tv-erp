<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        // ---- Create all permissions ----
        $permissions = [
            // Document permissions
            ['name' => 'documents.create', 'label_ar' => 'إنشاء كتاب رسمي', 'group' => 'documents'],
            ['name' => 'documents.send', 'label_ar' => 'إرسال كتاب رسمي', 'group' => 'documents'],
            ['name' => 'documents.receive', 'label_ar' => 'استلام كتاب رسمي', 'group' => 'documents'],
            ['name' => 'documents.approve', 'label_ar' => 'اعتماد كتاب رسمي', 'group' => 'documents'],
            ['name' => 'documents.reject', 'label_ar' => 'رفض كتاب رسمي', 'group' => 'documents'],
            ['name' => 'documents.archive', 'label_ar' => 'أرشفة كتاب رسمي', 'group' => 'documents'],
            ['name' => 'documents.view_all', 'label_ar' => 'عرض جميع الكتب', 'group' => 'documents'],
            // User permissions
            ['name' => 'users.create', 'label_ar' => 'إنشاء مستخدم', 'group' => 'users'],
            ['name' => 'users.edit', 'label_ar' => 'تعديل مستخدم', 'group' => 'users'],
            ['name' => 'users.delete', 'label_ar' => 'حذف مستخدم', 'group' => 'users'],
            ['name' => 'users.view', 'label_ar' => 'عرض المستخدمين', 'group' => 'users'],
            // Chat permissions
            ['name' => 'chat.send', 'label_ar' => 'إرسال رسالة', 'group' => 'chat'],
            ['name' => 'chat.read', 'label_ar' => 'قراءة الرسائل', 'group' => 'chat'],
            ['name' => 'chat.manage', 'label_ar' => 'إدارة الدردشات', 'group' => 'chat'],
            // Report permissions
            ['name' => 'reports.view', 'label_ar' => 'عرض التقارير', 'group' => 'reports'],
            ['name' => 'reports.export', 'label_ar' => 'تصدير التقارير', 'group' => 'reports'],
            // Activity logs
            ['name' => 'logs.view', 'label_ar' => 'عرض سجل العمليات', 'group' => 'settings'],
        ];

        $createdPermissions = [];
        foreach ($permissions as $perm) {
            $createdPermissions[$perm['name']] = Permission::create($perm);
        }

        // ---- Assign permissions to roles ----

        // Supervisor: All permissions
        $supervisor = Role::where('name', 'supervisor')->first();
        $supervisor->permissions()->attach(Permission::all()->pluck('id'));

        // General Manager
        $gm = Role::where('name', 'general_manager')->first();
        $gm->permissions()->attach([
            $createdPermissions['documents.create']->id,
            $createdPermissions['documents.send']->id,
            $createdPermissions['documents.receive']->id,
            $createdPermissions['documents.approve']->id,
            $createdPermissions['documents.reject']->id,
            $createdPermissions['documents.archive']->id,
            $createdPermissions['users.create']->id,
            $createdPermissions['users.edit']->id,
            $createdPermissions['users.view']->id,
            $createdPermissions['chat.send']->id,
            $createdPermissions['chat.read']->id,
            $createdPermissions['reports.view']->id,
        ]);

        // Department Manager
        $dm = Role::where('name', 'department_manager')->first();
        $dm->permissions()->attach([
            $createdPermissions['documents.create']->id,
            $createdPermissions['documents.send']->id,
            $createdPermissions['documents.receive']->id,
            $createdPermissions['documents.approve']->id,
            $createdPermissions['documents.reject']->id,
            $createdPermissions['users.view']->id,
            $createdPermissions['chat.send']->id,
            $createdPermissions['chat.read']->id,
        ]);

        // Employee
        $emp = Role::where('name', 'employee')->first();
        $emp->permissions()->attach([
            $createdPermissions['documents.create']->id,
            $createdPermissions['documents.send']->id,
            $createdPermissions['documents.receive']->id,
            $createdPermissions['chat.send']->id,
            $createdPermissions['chat.read']->id,
        ]);
    }
}
