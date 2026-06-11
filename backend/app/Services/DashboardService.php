<?php

namespace App\Services;

use App\Models\Office;
use App\Models\OfficialDocument;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function getSupervisorDashboard(): array
    {
        $totalEmployees = User::where('status', 'active')->count();
        $totalDocuments = OfficialDocument::count();
        $pendingDocuments = OfficialDocument::whereIn('status', ['sent', 'received', 'in_progress'])->count();
        $recentDocuments = OfficialDocument::with(['sender', 'receiver'])
            ->latest()
            ->take(10)
            ->get();

        $officeStats = Office::withCount(['users' => function ($q) {
            $q->where('status', 'active');
        }])->get()->map(function ($office) {
            return [
                'id' => $office->id,
                'name' => $office->name_ar,
                'employee_count' => $office->users_count,
                'document_count' => OfficialDocument::where('office_id', $office->id)->count(),
            ];
        });

        $departmentStats = DB::table('departments')
            ->join('users', 'departments.id', '=', 'users.department_id')
            ->where('users.status', 'active')
            ->select('departments.id', 'departments.name_ar', DB::raw('count(users.id) as employee_count'))
            ->groupBy('departments.id', 'departments.name_ar')
            ->get();

        return [
            'total_employees' => $totalEmployees,
            'total_documents' => $totalDocuments,
            'pending_documents' => $pendingDocuments,
            'recent_documents' => $recentDocuments,
            'office_stats' => $officeStats,
            'department_stats' => $departmentStats,
        ];
    }

    public function getGeneralManagerDashboard(string $officeId): array
    {
        $employeeCount = User::where('office_id', $officeId)->where('status', 'active')->count();

        $incomingDocuments = OfficialDocument::where('receiver_id', auth()->id())
            ->whereIn('status', ['sent', 'received', 'in_progress'])
            ->count();

        $outgoingDocuments = OfficialDocument::where('sender_id', auth()->id())
            ->whereIn('status', ['sent', 'received', 'in_progress'])
            ->count();

        $departmentPerformance = DB::table('departments')
            ->where('departments.office_id', $officeId)
            ->leftJoin('official_documents', function ($join) {
                $join->on('departments.id', '=', 'official_documents.department_id')
                    ->where('official_documents.created_at', '>=', now()->subMonth());
            })
            ->select('departments.name_ar', DB::raw('count(official_documents.id) as document_count'))
            ->groupBy('departments.id', 'departments.name_ar')
            ->get();

        $recentDocuments = OfficialDocument::where('office_id', $officeId)
            ->with(['sender', 'receiver'])
            ->latest()
            ->take(10)
            ->get();

        return [
            'employee_count' => $employeeCount,
            'incoming_documents' => $incomingDocuments,
            'outgoing_documents' => $outgoingDocuments,
            'department_performance' => $departmentPerformance,
            'recent_documents' => $recentDocuments,
        ];
    }

    public function getDepartmentManagerDashboard(string $departmentId): array
    {
        $employeeCount = User::where('department_id', $departmentId)
            ->where('status', 'active')
            ->count();

        $myDocuments = OfficialDocument::where(function ($q) {
            $q->where('sender_id', auth()->id())
                ->orWhere('receiver_id', auth()->id());
        })->whereIn('status', ['sent', 'received', 'in_progress'])->count();

        $departmentDocuments = OfficialDocument::where('department_id', $departmentId)
            ->whereIn('status', ['sent', 'received', 'in_progress'])
            ->count();

        $pendingTasks = OfficialDocument::where('receiver_id', auth()->id())
            ->whereIn('status', ['sent', 'received'])
            ->count();

        $employees = User::where('department_id', $departmentId)
            ->where('status', 'active')
            ->select('id', 'full_name_ar', 'employee_number', 'job_title_ar')
            ->get();

        $recentDocuments = OfficialDocument::where(function ($q) use ($departmentId) {
            $q->where('department_id', $departmentId)
                ->orWhere('sender_id', auth()->id())
                ->orWhere('receiver_id', auth()->id());
        })->with(['sender', 'receiver'])->latest()->take(10)->get();

        return [
            'employee_count' => $employeeCount,
            'my_documents' => $myDocuments,
            'department_documents' => $departmentDocuments,
            'pending_tasks' => $pendingTasks,
            'employees' => $employees,
            'recent_documents' => $recentDocuments,
        ];
    }

    public function getEmployeeDashboard(): array
    {
        $userId = auth()->id();

        $sentDocuments = OfficialDocument::where('sender_id', $userId)->count();
        $receivedDocuments = OfficialDocument::where('receiver_id', $userId)->count();
        $pendingDocuments = OfficialDocument::where('sender_id', $userId)
            ->whereIn('status', ['sent', 'in_progress'])
            ->count();

        $recentDocuments = OfficialDocument::where(function ($q) use ($userId) {
            $q->where('sender_id', $userId)->orWhere('receiver_id', $userId);
        })->with(['sender', 'receiver'])->latest()->take(10)->get();

        return [
            'sent_documents' => $sentDocuments,
            'received_documents' => $receivedDocuments,
            'pending_documents' => $pendingDocuments,
            'recent_documents' => $recentDocuments,
        ];
    }
}
