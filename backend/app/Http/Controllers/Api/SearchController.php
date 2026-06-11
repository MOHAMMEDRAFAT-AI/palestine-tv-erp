<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OfficialDocument;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    use ApiResponse;

    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2',
            'type' => 'sometimes|in:all,documents,users',
        ]);

        $query = $request->q;
        $type = $request->type ?? 'all';
        $user = auth()->user();

        $results = [];

        if (in_array($type, ['all', 'documents'])) {
            $documentsQuery = OfficialDocument::query()
                ->where(function ($q) use ($query) {
                    $q->where('title', 'like', "%{$query}%")
                        ->orWhere('document_number', 'like', "%{$query}%")
                        ->orWhere('body', 'like', "%{$query}%");
                });

            if (!$user->isSupervisor()) {
                if ($user->isGeneralManager()) {
                    $documentsQuery->where('office_id', $user->office_id);
                } elseif ($user->isDepartmentManager()) {
                    $documentsQuery->where('department_id', $user->department_id);
                } else {
                    $documentsQuery->where(function ($q) use ($user) {
                        $q->where('sender_id', $user->id)
                            ->orWhere('receiver_id', $user->id);
                    });
                }
            }

            $results['documents'] = $documentsQuery
                ->with(['sender:id,full_name_ar', 'receiver:id,full_name_ar'])
                ->take(20)
                ->get();
        }

        if (in_array($type, ['all', 'users'])) {
            $usersQuery = User::where('status', 'active')
                ->where(function ($q) use ($query) {
                    $q->where('full_name_ar', 'like', "%{$query}%")
                        ->orWhere('employee_number', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%")
                        ->orWhere('job_title_ar', 'like', "%{$query}%");
                });

            if (!$user->isSupervisor()) {
                if ($user->isGeneralManager()) {
                    $usersQuery->where('office_id', $user->office_id);
                } elseif ($user->isDepartmentManager()) {
                    $usersQuery->where('department_id', $user->department_id);
                }
            }

            $results['users'] = $usersQuery
                ->with(['office:id,name_ar', 'department:id,name_ar', 'role:id,label_ar'])
                ->take(20)
                ->get();
        }

        return $this->success($results);
    }

    public function advanced(Request $request): JsonResponse
    {
        $request->validate([
            'employee_number' => 'sometimes|string|max:20',
            'name' => 'sometimes|string|max:255',
            'document_number' => 'sometimes|string|max:50',
            'date_from' => 'sometimes|date',
            'date_to' => 'sometimes|date|after_or_equal:date_from',
            'status' => 'sometimes|in:draft,sent,received,in_progress,completed,archived,rejected',
            'office_id' => 'sometimes|exists:offices,id',
            'department_id' => 'sometimes|exists:departments,id',
        ]);

        $user = auth()->user();
        $results = [];

        if ($request->has('employee_number') || $request->has('name')) {
            $usersQuery = User::where('status', 'active');

            if ($request->filled('employee_number')) {
                $usersQuery->where('employee_number', 'like', "%{$request->employee_number}%");
            }
            if ($request->filled('name')) {
                $usersQuery->where('full_name_ar', 'like', "%{$request->name}%");
            }

            if (!$user->isSupervisor()) {
                if ($user->isGeneralManager()) {
                    $usersQuery->where('office_id', $user->office_id);
                } elseif ($user->isDepartmentManager()) {
                    $usersQuery->where('department_id', $user->department_id);
                }
            }

            $results['users'] = $usersQuery->get();
        }

        $documentsQuery = OfficialDocument::query();

        if ($request->filled('document_number')) {
            $documentsQuery->where('document_number', 'like', "%{$request->document_number}%");
        }
        if ($request->filled('date_from')) {
            $documentsQuery->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $documentsQuery->whereDate('created_at', '<=', $request->date_to);
        }
        if ($request->filled('status')) {
            $documentsQuery->where('status', $request->status);
        }

        if (!$user->isSupervisor()) {
            if ($user->isGeneralManager()) {
                $documentsQuery->where('office_id', $user->office_id);
            } elseif ($user->isDepartmentManager()) {
                $documentsQuery->where('department_id', $user->department_id);
            } else {
                $documentsQuery->where(function ($q) use ($user) {
                    $q->where('sender_id', $user->id)
                        ->orWhere('receiver_id', $user->id);
                });
            }
        }

        $results['documents'] = $documentsQuery->with([
            'sender:id,full_name_ar',
            'receiver:id,full_name_ar',
        ])->get();

        return $this->success($results);
    }
}
