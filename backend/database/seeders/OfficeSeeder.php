<?php

namespace Database\Seeders;

use App\Models\Office;
use Illuminate\Database\Seeder;

class OfficeSeeder extends Seeder
{
    public function run(): void
    {
        Office::create([
            'name_ar' => 'مكتب رام الله',
            'name_en' => 'Ramallah Office',
            'type' => 'main',
            'location' => 'رام الله - الضفة الغربية',
            'phone' => '+970-2-XXX-XXXX',
            'email' => 'ramallah@palestinetv.ps',
            'is_active' => true,
        ]);

        Office::create([
            'name_ar' => 'مكتب غزة',
            'name_en' => 'Gaza Office',
            'type' => 'branch',
            'location' => 'غزة - قطاع غزة',
            'phone' => '+970-8-XXX-XXXX',
            'email' => 'gaza@palestinetv.ps',
            'is_active' => true,
        ]);
    }
}
