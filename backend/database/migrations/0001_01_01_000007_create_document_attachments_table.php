<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_attachments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('document_id')->constrained('official_documents')->cascadeOnDelete();
            $table->string('original_name');
            $table->string('stored_path');
            $table->string('mime_type');
            $table->integer('file_size')->unsigned(); // bytes
            $table->string('extension', 10);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_attachments');
    }
};
