<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('official_documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('document_number', 50)->unique(); // رقم الكتاب التلقائي
            $table->foreignUuid('sender_id')->constrained('users');
            $table->foreignUuid('receiver_id')->constrained('users');
            $table->foreignUuid('office_id')->constrained('offices');
            $table->foreignUuid('department_id')->nullable()->constrained('departments');
            $table->string('title'); // عنوان الكتاب
            $table->text('body'); // نص الكتاب
            $table->enum('priority', ['normal', 'important', 'urgent', 'very_urgent'])->default('normal');
            $table->enum('status', [
                'draft',        // مسودة
                'sent',         // مرسل
                'received',     // مستلم
                'in_progress',  // قيد المتابعة
                'completed',    // منجز
                'archived',     // مؤرشف
                'rejected'      // مرفوض مع ملاحظات
            ])->default('draft');
            $table->text('rejection_reason')->nullable(); // سبب الرفض مع الملاحظات
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('received_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['sender_id', 'receiver_id']);
            $table->index('status');
            $table->index('priority');
            $table->index('document_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('official_documents');
    }
};
