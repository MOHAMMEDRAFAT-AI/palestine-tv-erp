<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name'); // supervisor, general_manager, department_manager, employee
            $table->string('label_ar'); // المشرف العام, مدير عام, مدير دائرة, موظف
            $table->string('label_en')->nullable();
            $table->integer('level')->unsigned(); // 1=supervisor, 2=general_manager, 3=department_manager, 4=employee
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('roles');
    }
};
