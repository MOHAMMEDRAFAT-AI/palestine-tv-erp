<?php

namespace App\Http\Middleware;

use App\Traits\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    use ApiResponse;

    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return $this->error('غير مصرح بالدخول', 401);
        }

        if (!in_array($user->role?->name, $roles)) {
            return $this->error('ليس لديك صلاحية للوصول إلى هذه الموارد', 403);
        }

        return $next($request);
    }
}
