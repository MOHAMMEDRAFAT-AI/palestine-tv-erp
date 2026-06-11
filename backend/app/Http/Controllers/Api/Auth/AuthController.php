<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    use ApiResponse;

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'employee_number' => 'required_without:email|string',
            'email' => 'required_without:employee_number|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return $this->error('بيانات الدخول غير صحيحة', 422, $validator->errors());
        }

        $credentials = $request->only('password');
        $field = $request->has('employee_number') ? 'employee_number' : 'email';
        $credentials[$field] = $request->input($field);

        if (!$token = JWTAuth::attempt($credentials)) {
            return $this->error('رقم وظيفي/بريد إلكتروني أو كلمة مرور غير صحيحة', 401);
        }

        $user = auth()->user();

        if ($user->status !== 'active') {
            JWTAuth::invalidate($token);
            return $this->error('حسابك غير نشط. الرجاء التواصل مع المشرف.', 403);
        }

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ]);

        ActivityLog::log([
            'user_id' => $user->id,
            'action' => 'login',
            'description_ar' => 'تسجيل دخول',
            'ip_address' => $request->ip(),
        ]);

        return $this->success([
            'user' => $user->load(['office', 'department', 'role', 'manager']),
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ], 'تم تسجيل الدخول بنجاح');
    }

    public function logout(): JsonResponse
    {
        ActivityLog::log([
            'user_id' => auth()->id(),
            'action' => 'logout',
            'description_ar' => 'تسجيل خروج',
        ]);

        JWTAuth::invalidate(JWTAuth::getToken());

        return $this->success(null, 'تم تسجيل الخروج بنجاح');
    }

    public function me(): JsonResponse
    {
        $user = auth()->user()->load([
            'office',
            'department',
            'role',
            'manager:id,full_name_ar,job_title_ar,avatar',
            'subordinates:id,full_name_ar,employee_number,job_title_ar,avatar',
        ]);

        return $this->success($user);
    }

    public function refresh(): JsonResponse
    {
        return $this->success([
            'token' => JWTAuth::refresh(JWTAuth::getToken()),
            'token_type' => 'bearer',
            'expires_in' => auth('api')->factory()->getTTL() * 60,
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'full_name_ar' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'avatar' => 'sometimes|image|mimes:jpeg,png,jpg,gif|max:2048',
            'locale' => 'sometimes|in:ar,en',
        ]);

        if ($validator->fails()) {
            return $this->error('بيانات غير صحيحة', 422, $validator->errors());
        }

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        $user->update($request->only(['full_name_ar', 'phone', 'locale']));

        return $this->success($user->fresh()->load(['office', 'department', 'role']), 'تم تحديث الملف الشخصي');
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return $this->error('بيانات غير صحيحة', 422, $validator->errors());
        }

        $user = auth()->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->error('كلمة المرور الحالية غير صحيحة', 400);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        ActivityLog::log([
            'user_id' => $user->id,
            'action' => 'change_password',
            'description_ar' => 'تغيير كلمة المرور',
        ]);

        return $this->success(null, 'تم تغيير كلمة المرور بنجاح');
    }
}
