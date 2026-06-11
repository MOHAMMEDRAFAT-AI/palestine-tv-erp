<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $query = Department::where('is_active', true);

        if ($request->filled('office_id')) {
            $query->where('office_id', $request->office_id);
        }

        $departments = $query->get(['id', 'office_id', 'name_ar', 'name_en', 'code']);
        return $this->success($departments);
    }
}
