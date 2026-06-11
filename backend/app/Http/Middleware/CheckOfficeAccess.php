<?php

namespace App\Http\Middleware;

use App\Traits\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckOfficeAccess
{
    use ApiResponse;

    public function handle(Request $request, Closure $next, string $paramName = 'office'): Response
    {
        $user = $request->user();

        if (!$user) {
            return $this->error('غير مصرح بالدخول', 401);
        }

        if ($user->isSupervisor()) {
            return $next($request);
        }

        $officeId = $request->route($paramName) ?? $request->input('office_id');

        if ($officeId && $user->office_id !== $officeId) {
            return $this->error('ليس لديك صلاحية للوصول إلى بيانات هذا المكتب', 403);
        }

        return $next($request);
    }
}
