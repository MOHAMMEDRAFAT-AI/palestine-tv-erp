<?php

namespace Database\Seeders;

use App\Models\Office;
use App\Models\Role;
use App\Models\User;
use App\Models\Department;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $supervisorRole = Role::where('name', 'supervisor')->first();
        $gmRole = Role::where('name', 'general_manager')->first();
        $dmRole = Role::where('name', 'department_manager')->first();
        $empRole = Role::where('name', 'employee')->first();

        $ramallah = Office::where('name_ar', 'مكتب رام الله')->first();
        $gaza = Office::where('name_ar', 'مكتب غزة')->first();

        // Super Admin (Supervisor)
        $supervisor = User::create([
            'employee_number' => 'PTV-0001',
            'full_name_ar' => 'المشرف العام',
            'full_name_en' => 'General Supervisor',
            'email' => 'supervisor@palestinetv.ps',
            'phone' => '+970-59X-XXX-XXX',
            'password' => Hash::make('P@ssw0rd'),
            'office_id' => $ramallah->id,
            'department_id' => Department::where('office_id', $ramallah->id)->first()->id,
            'role_id' => $supervisorRole->id,
            'job_title_ar' => 'المشرف العام على تلفزيون فلسطين',
            'job_title_en' => 'General Supervisor of Palestine TV',
            'status' => 'active',
        ]);

        // General Manager - Ramallah
        $gmRamallah = User::create([
            'employee_number' => 'PTV-0002',
            'full_name_ar' => 'مدير عام رام الله',
            'full_name_en' => 'General Manager of Ramallah',
            'email' => 'gm.ramallah@palestinetv.ps',
            'phone' => '+970-59X-XXX-XXX',
            'password' => Hash::make('P@ssw0rd'),
            'office_id' => $ramallah->id,
            'department_id' => Department::where('office_id', $ramallah->id)->first()->id,
            'role_id' => $gmRole->id,
            'manager_id' => $supervisor->id,
            'job_title_ar' => 'المدير العام لمكتب رام الله',
            'job_title_en' => 'General Manager of Ramallah Office',
            'status' => 'active',
        ]);

        // General Manager - Gaza
        $gmGaza = User::create([
            'employee_number' => 'PTV-0003',
            'full_name_ar' => 'مدير عام غزة',
            'full_name_en' => 'General Manager of Gaza',
            'email' => 'gm.gaza@palestinetv.ps',
            'phone' => '+970-59X-XXX-XXX',
            'password' => Hash::make('P@ssw0rd'),
            'office_id' => $gaza->id,
            'department_id' => Department::where('office_id', $gaza->id)->first()->id,
            'role_id' => $gmRole->id,
            'manager_id' => $supervisor->id,
            'job_title_ar' => 'المدير العام لمكتب غزة',
            'job_title_en' => 'General Manager of Gaza Office',
            'status' => 'active',
        ]);

        // Department Managers for each department in each office
        $offices = [$ramallah, $gaza];
        $departmentCodes = ['NEWS', 'PROG', 'ENG', 'ADM', 'FIN'];
        $dmData = [
            'NEWS' => ['name' => 'مدير دائرة الأخبار', 'job' => 'مدير دائرة الأخبار'],
            'PROG' => ['name' => 'مدير دائرة البرامج', 'job' => 'مدير دائرة البرامج'],
            'ENG' => ['name' => 'مدير دائرة الهندسة', 'job' => 'مدير دائرة الهندسة'],
            'ADM' => ['name' => 'مدير دائرة الشؤون الإدارية', 'job' => 'مدير دائرة الشؤون الإدارية'],
            'FIN' => ['name' => 'مدير دائرة الشؤون المالية', 'job' => 'مدير دائرة الشؤون المالية'],
        ];

        $empSeq = 4;
        foreach ($offices as $office) {
            $gm = $office->id === $ramallah->id ? $gmRamallah : $gmGaza;
            $code = $office->id === $ramallah->id ? 'R' : 'G';

            foreach ($departmentCodes as $deptCode) {
                $dept = Department::where('office_id', $office->id)
                    ->where('code', $deptCode)->first();

                $dm = User::create([
                    'employee_number' => "PTV-{$code}-" . str_pad($empSeq++, 4, '0', STR_PAD_LEFT),
                    'full_name_ar' => "{$dmData[$deptCode]['name']} - {$office->name_ar}",
                    'email' => strtolower("{$deptCode}.{$code}@palestinetv.ps"),
                    'password' => Hash::make('P@ssw0rd'),
                    'office_id' => $office->id,
                    'department_id' => $dept->id,
                    'role_id' => $dmRole->id,
                    'manager_id' => $gm->id,
                    'job_title_ar' => $dmData[$deptCode]['job'],
                    'status' => 'active',
                ]);

                // Create 2 employees per department
                for ($i = 1; $i <= 2; $i++) {
                    User::create([
                        'employee_number' => "PTV-{$code}-" . str_pad($empSeq++, 4, '0', STR_PAD_LEFT),
                        'full_name_ar' => "موظف {$deptData[$deptCode]['name']} {$i} - {$office->name_ar}",
                        'email' => strtolower("{$deptCode}.{$code}.{$i}@palestinetv.ps"),
                        'password' => Hash::make('P@ssw0rd'),
                        'office_id' => $office->id,
                        'department_id' => $dept->id,
                        'role_id' => $empRole->id,
                        'manager_id' => $dm->id,
                        'job_title_ar' => "موظف {$deptData[$deptCode]['job']}",
                        'status' => 'active',
                    ]);
                }
            }
        }
    }

    private array $deptData = [
        'NEWS' => ['name' => 'الأخبار'],
        'PROG' => ['name' => 'البرامج'],
        'ENG' => ['name' => 'الهندسة'],
        'ADM' => ['name' => 'الشؤون الإدارية'],
        'FIN' => ['name' => 'الشؤون المالية'],
    ];
}
