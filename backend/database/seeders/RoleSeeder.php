<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::create([
            'name' => 'supervisor',
            'label_ar' => 'المشرف العام',
            'label_en' => 'General Supervisor',
            'level' => 1,
            'description' => 'المشرف العام على تلفزيون فلسطين - المستوى الإداري الأعلى',
        ]);

        Role::create([
            'name' => 'general_manager',
            'label_ar' => 'مدير عام',
            'label_en' => 'General Manager',
            'level' => 2,
            'description' => 'المدير العام للمكتب (رام الله أو غزة)',
        ]);

        Role::create([
            'name' => 'department_manager',
            'label_ar' => 'مدير دائرة',
            'label_en' => 'Department Manager',
            'level' => 3,
            'description' => 'مدير إحدى الدوائر (الأخبار، البرامج، الهندسة، الشؤون الإدارية، الشؤون المالية)',
        ]);

        Role::create([
            'name' => 'employee',
            'label_ar' => 'موظف',
            'label_en' => 'Employee',
            'level' => 4,
            'description' => 'موظف تابع لإحدى الدوائر',
        ]);
    }
}
