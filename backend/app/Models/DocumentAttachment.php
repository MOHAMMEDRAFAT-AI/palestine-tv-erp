<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentAttachment extends Model
{
    use HasUuids;

    protected $fillable = [
        'document_id',
        'original_name',
        'stored_path',
        'mime_type',
        'file_size',
        'extension',
    ];

    public function document(): BelongsTo
    {
        return $this->belongsTo(OfficialDocument::class);
    }

    public function getSizeForHumans(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }
        return round($bytes, 2) . ' ' . $units[$i];
    }
}
