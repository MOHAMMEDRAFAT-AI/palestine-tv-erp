<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    use ApiResponse;

    public function __construct()
    {
        $this->middleware('role:supervisor');
    }

    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::with('user:id,full_name_ar,employee_number,avatar');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('action')) {
            $query->where('action', $request->action);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 50);

        return $this->paginated($logs);
    }

    public function show(string $id): JsonResponse
    {
        $log = ActivityLog::with('user:id,full_name_ar,employee_number,avatar')
            ->findOrFail($id);

        return $this->success($log);
    }

    public function stats(): JsonResponse
    {
        $stats = [
            'total_logs' => ActivityLog::count(),
            'today_logs' => ActivityLog::whereDate('created_at', today())->count(),
            'login_count' => ActivityLog::where('action', 'login')->count(),
            'document_actions' => ActivityLog::whereIn('action', [
                'create_document', 'update_document', 'delete_document',
            ])->count(),
            'user_actions' => ActivityLog::whereIn('action', [
                'create_user', 'update_user', 'delete_user',
            ])->count(),
            'recent_actions' => ActivityLog::with('user:id,full_name_ar,avatar')
                ->latest()->take(20)->get(),
        ];

        return $this->success($stats);
    }
}
