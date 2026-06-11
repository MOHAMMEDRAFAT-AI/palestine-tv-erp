<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_rooms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('type', [
                'department',   // دردشة الدائرة
                'office',       // دردشة المكتب
                'top_management', // دردشة الإدارة العليا
                'direct'        // محادثة مباشرة
            ]);
            $table->string('name_ar');
            $table->string('name_en')->nullable();
            $table->foreignUuid('office_id')->nullable()->constrained('offices');
            $table->foreignUuid('department_id')->nullable()->constrained('departments');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['type', 'office_id', 'department_id']);
        });

        Schema::create('chat_room_user', function (Blueprint $table) {
            $table->foreignUuid('chat_room_id')->constrained('chat_rooms')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('last_read_at')->nullable();
            $table->boolean('is_muted')->default(false);
            $table->primary(['chat_room_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_room_user');
        Schema::dropIfExists('chat_rooms');
    }
};
