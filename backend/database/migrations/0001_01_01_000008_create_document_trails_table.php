<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_trails', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('document_id')->constrained('official_documents')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users');
            $table->enum('action', [
                'created',      // تم الإنشاء
                'sent',         // تم الإرسال
                'received',     // تم الاستلام
                'viewed',       // تم الاطلاع
                'approved',     // تم الاعتماد
                'rejected',     // تم الرفض
                'returned',     // تم الإعادة للمستوى الأدنى
                'in_progress',  // قيد المتابعة
                'completed',    // تم الإنجاز
                'archived',     // تم الأرشفة
                'attachment_added', // إضافة مرفق
                'attachment_removed', // حذف مرفق
            ]);
            $table->text('notes')->nullable(); // ملاحظات الإجراء
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->json('metadata')->nullable(); // بيانات إضافية
            $table->timestamps();

            $table->index(['document_id', 'user_id', 'action']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_trails');
    }
};
