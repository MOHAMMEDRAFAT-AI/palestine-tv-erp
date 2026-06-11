<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->user() && in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'])) {
            $description = $this->getActionDescription($request);

            if ($description) {
                ActivityLog::log([
                    'user_id' => $request->user()->id,
                    'action' => $this->getActionName($request),
                    'description_ar' => $description,
                    'entity_type' => $this->getEntityType($request),
                    'entity_id' => $request->route('id'),
                ]);
            }
        }

        return $response;
    }

    private function getActionName(Request $request): string
    {
        $method = $request->method();
        $path = $request->path();

        return match (true) {
            str_contains($path, 'documents') && $method === 'POST' => 'create_document',
            str_contains($path, 'documents') && $method === 'PUT' => 'update_document',
            str_contains($path, 'documents') && $method === 'DELETE' => 'delete_document',
            str_contains($path, 'users') && $method === 'POST' => 'create_user',
            str_contains($path, 'users') && $method === 'PUT' => 'update_user',
            str_contains($path, 'users') && $method === 'DELETE' => 'delete_user',
            default => strtolower($method) . '_' . basename($path),
        };
    }

    private function getActionDescription(Request $request): ?string
    {
        $method = $request->method();
        $path = $request->path();

        return match (true) {
            str_contains($path, 'documents') && $method === 'POST' => 'إنشاء كتاب رسمي جديد',
            str_contains($path, 'documents') && $method === 'PUT' => 'تعديل كتاب رسمي',
            str_contains($path, 'documents') && $method === 'DELETE' => 'حذف كتاب رسمي',
            str_contains($path, 'users') && $method === 'POST' => 'إنشاء مستخدم جديد',
            str_contains($path, 'users') && $method === 'PUT' => 'تعديل بيانات مستخدم',
            str_contains($path, 'users') && $method === 'DELETE' => 'حذف مستخدم',
            default => null,
        };
    }

    private function getEntityType(Request $request): ?string
    {
        return match (true) {
            str_contains($request->path(), 'documents') => 'document',
            str_contains($request->path(), 'users') => 'user',
            str_contains($request->path(), 'chat') => 'chat',
            default => null,
        };
    }
}
