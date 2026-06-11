<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\DocumentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    use ApiResponse;

    public function __construct(private DocumentService $documentService) {}

    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();

        $query = User::with(['office', 'department', 'role', 'manager:id,full_name_ar']);

        if ($user->isSupervisor()) {
            // Can see all users
        } elseif ($user->isGeneralManager()) {
            $query->where('office_id', $user->office_id);
        } elseif ($user->isDepartmentManager()) {
            $query->where('department_id', $user->department_id);
        } else {
            $query->where('id', $user->id);
        }

        $users = $query->filter($request->all())
            ->sort($request->sort_by, $request->sort_dir)
            ->paginate($request->per_page ?? 15);

        return $this->paginated($users);
    }

    public function store(Request $request): JsonResponse
    {
        $authUser = auth()->user();

        if (!$authUser->isSupervisor() && !$authUser->isGeneralManager()) {
            return $this->error('ليس لديك صلاحية لإنشاء مستخدمين جدد', 403);
        }

        $validator = Validator::make($request->all(), [
            'employee_number' => 'required|string|max:20|unique:users',
            'full_name_ar' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'office_id' => 'required|exists:offices,id',
            'department_id' => 'required|exists:departments,id',
            'role_id' => 'required|exists:roles,id',
            'manager_id' => 'nullable|exists:users,id',
            'job_title_ar' => 'required|string|max:255',
            'status' => 'sometimes|in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return $this->error('بيانات غير صحيحة', 422, $validator->errors());
        }

        // Validate hierarchical creation
        if ($authUser->isGeneralManager()) {
            $role = \App\Models\Role::find($request->role_id);
            if (in_array($role->name, ['supervisor', 'general_manager'])) {
                return $this->error('لا يمكنك إنشاء مستخدمين بهذا المستوى الإداري', 403);
            }
            if ($request->office_id !== $authUser->office_id) {
                return $this->error('يمكنك إنشاء مستخدمين في مكتبك فقط', 403);
            }
        }

        $data = $request->all();
        $data['password'] = Hash::make($data['password']);

        $newUser = User::create($data);

        \App\Models\ActivityLog::log([
            'user_id' => $authUser->id,
            'action' => 'create_user',
            'description_ar' => "إنشاء مستخدم جديد: {$newUser->full_name_ar}",
            'entity_type' => 'user',
            'entity_id' => $newUser->id,
            'new_values' => $newUser->toArray(),
        ]);

        return $this->created(
            $newUser->load(['office', 'department', 'role', 'manager']),
            'تم إنشاء المستخدم بنجاح'
        );
    }

    public function show(string $id): JsonResponse
    {
        $user = User::with([
            'office', 'department', 'role',
            'manager:id,full_name_ar,employee_number,job_title_ar,avatar',
            'subordinates:id,full_name_ar,employee_number,job_title_ar,avatar',
        ])->findOrFail($id);

        $authUser = auth()->user();

        if (!$authUser->isSupervisor() &&
            !($authUser->isGeneralManager() && $user->office_id === $authUser->office_id) &&
            !($authUser->isDepartmentManager() && $user->department_id === $authUser->department_id) &&
            $authUser->id !== $user->id) {
            return $this->error('ليس لديك صلاحية لعرض بيانات هذا المستخدم', 403);
        }

        return $this->success($user);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $authUser = auth()->user();

        if (!$authUser->isSupervisor() && !$authUser->isGeneralManager()) {
            return $this->error('ليس لديك صلاحية لتعديل المستخدمين', 403);
        }

        if ($authUser->isGeneralManager() && $user->office_id !== $authUser->office_id) {
            return $this->error('يمكنك تعديل مستخدمين في مكتبك فقط', 403);
        }

        $validator = Validator::make($request->all(), [
            'full_name_ar' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'job_title_ar' => 'sometimes|string|max:255',
            'status' => 'sometimes|in:active,inactive,suspended',
            'department_id' => 'sometimes|exists:departments,id',
            'role_id' => 'sometimes|exists:roles,id',
            'manager_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return $this->error('بيانات غير صحيحة', 422, $validator->errors());
        }

        $oldValues = $user->toArray();
        $user->update($request->all());

        \App\Models\ActivityLog::log([
            'user_id' => $authUser->id,
            'action' => 'update_user',
            'description_ar' => "تعديل بيانات المستخدم: {$user->full_name_ar}",
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'old_values' => $oldValues,
            'new_values' => $user->fresh()->toArray(),
        ]);

        return $this->success(
            $user->fresh()->load(['office', 'department', 'role', 'manager']),
            'تم تحديث بيانات المستخدم بنجاح'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $authUser = auth()->user();

        if (!$authUser->isSupervisor()) {
            return $this->error('ليس لديك صلاحية لحذف المستخدمين', 403);
        }

        if ($user->isSupervisor() && $authUser->id !== $user->id) {
            return $this->error('لا يمكن حذف المشرف العام', 403);
        }

        $user->update(['status' => 'inactive']);
        $user->delete(); // Soft delete

        \App\Models\ActivityLog::log([
            'user_id' => $authUser->id,
            'action' => 'delete_user',
            'description_ar' => "حذف المستخدم: {$user->full_name_ar}",
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'old_values' => $user->toArray(),
        ]);

        return $this->success(null, 'تم حذف المستخدم بنجاح');
    }
}
