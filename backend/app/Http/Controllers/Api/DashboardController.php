<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Services\DashboardService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    public function __construct(private DashboardService $dashboardService) {}

    public function index(): JsonResponse
    {
        $user = auth()->user();

        $data = match ($user->role->name) {
            Role::SUPERVISOR => $this->dashboardService->getSupervisorDashboard(),
            Role::GENERAL_MANAGER => $this->dashboardService->getGeneralManagerDashboard($user->office_id),
            Role::DEPARTMENT_MANAGER => $this->dashboardService->getDepartmentManagerDashboard($user->department_id),
            Role::EMPLOYEE => $this->dashboardService->getEmployeeDashboard(),
            default => [],
        };

        return $this->success($data);
    }
}
