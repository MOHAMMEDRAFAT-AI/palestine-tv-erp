<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action'); // login, logout, create_document, send_document, approve_document, reject_document, create_user, delete_user, etc.
            $table->string('description_ar');
            $table->string('description_en')->nullable();
            $table->string('entity_type')->nullable(); // document, user, chat, etc.
            $table->string('entity_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->string('method')->nullable(); // GET, POST, PUT, DELETE
            $table->string('route')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'action', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
