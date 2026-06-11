<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Office;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $offices = Office::all();

        $departments = [
            ['code' => 'NEWS', 'name_ar' => 'دائرة الأخبار', 'name_en' => 'News Department'],
            ['code' => 'PROG', 'name_ar' => 'دائرة البرامج', 'name_en' => 'Programs Department'],
            ['code' => 'ENG', 'name_ar' => 'دائرة الهندسة', 'name_en' => 'Engineering Department'],
            ['code' => 'ADM', 'name_ar' => 'دائرة الشؤون الإدارية', 'name_en' => 'Administrative Affairs Department'],
            ['code' => 'FIN', 'name_ar' => 'دائرة الشؤون المالية', 'name_en' => 'Financial Affairs Department'],
        ];

        foreach ($offices as $office) {
            foreach ($departments as $dept) {
                Department::create(array_merge($dept, [
                    'office_id' => $office->id,
                    'description' => "{$dept['name_ar']} - {$office->name_ar}",
                    'is_active' => true,
                ]));
            }
        }
    }
}
