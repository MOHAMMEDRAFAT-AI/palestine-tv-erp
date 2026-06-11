<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('employee_number', 20)->unique(); // الرقم الوظيفي
            $table->string('full_name_ar'); // الاسم الكامل بالعربية
            $table->string('full_name_en')->nullable();
            $table->string('email')->unique();
            $table->string('phone', 20)->nullable();
            $table->string('password');
            $table->foreignUuid('office_id')->constrained('offices');
            $table->foreignUuid('department_id')->constrained('departments');
            $table->foreignUuid('role_id')->constrained('roles');
            $table->foreignUuid('manager_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('job_title_ar'); // المسمى الوظيفي
            $table->string('job_title_en')->nullable();
            $table->string('avatar')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip')->nullable();
            $table->string('locale', 5)->default('ar');
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['office_id', 'department_id', 'role_id']);
            $table->index('employee_number');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
