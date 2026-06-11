<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('chat_room_id')->constrained('chat_rooms')->cascadeOnDelete();
            $table->foreignUuid('sender_id')->constrained('users');
            $table->text('body')->nullable();
            $table->string('type', 20)->default('text'); // text, image, file, system
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_type')->nullable();
            $table->integer('file_size')->unsigned()->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['chat_room_id', 'created_at']);
            $table->index('sender_id');
        });

        Schema::create('message_reads', function (Blueprint $table) {
            $table->foreignUuid('message_id')->constrained('messages')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('read_at');
            $table->primary(['message_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('message_reads');
        Schema::dropIfExists('messages');
    }
};
