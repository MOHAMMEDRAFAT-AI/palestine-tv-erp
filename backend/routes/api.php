<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\OfficeController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Palestine TV (تلفزيون فلسطين)
|--------------------------------------------------------------------------
|
| Hierarchical RBAC system with strict administrative chain enforcement.
| All routes are prefixed with /api/v1
|
*/

Route::prefix('v1')->group(function () {

    // ==========================================
    // Public Routes
    // ==========================================
    Route::post('auth/login', [AuthController::class, 'login']);

    // ==========================================
    // Protected Routes (JWT Required)
    // ==========================================
    Route::middleware(['auth:api'])->group(function () {

        // ---- Authentication ----
        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('refresh', [AuthController::class, 'refresh']);
            Route::get('me', [AuthController::class, 'me']);
            Route::put('profile', [AuthController::class, 'updateProfile']);
            Route::put('change-password', [AuthController::class, 'changePassword']);
        });

        // ---- Reference Data ----
        Route::get('offices', [OfficeController::class, 'index']);
        Route::get('departments', [DepartmentController::class, 'index']);
        Route::get('roles', [RoleController::class, 'index']);

        // ---- Dashboard ----
        Route::get('dashboard', [DashboardController::class, 'index']);

        // ---- Users ----
        Route::apiResource('users', UserController::class);

        // ---- Documents ----
        Route::prefix('documents')->group(function () {
            Route::get('/', [DocumentController::class, 'index']);
            Route::post('/', [DocumentController::class, 'store']);
            Route::get('{id}', [DocumentController::class, 'show']);
            Route::post('{id}/send', [DocumentController::class, 'send']);
            Route::post('{id}/receive', [DocumentController::class, 'receive']);
            Route::post('{id}/approve', [DocumentController::class, 'approve']);
            Route::post('{id}/reject', [DocumentController::class, 'reject']);
            Route::post('{id}/return', [DocumentController::class, 'returnToSender']);
            Route::post('{id}/archive', [DocumentController::class, 'archive']);
            Route::post('{id}/attachments', [DocumentController::class, 'uploadAttachment']);
            Route::get('{id}/trail', [DocumentController::class, 'trail']);
        });

        // ---- Chat ----
        Route::prefix('chat')->group(function () {
            Route::get('rooms', [ChatController::class, 'rooms']);
            Route::get('rooms/{roomId}/messages', [ChatController::class, 'messages']);
            Route::post('rooms/{roomId}/send', [ChatController::class, 'send']);
            Route::post('rooms/{roomId}/read', [ChatController::class, 'markRead']);
            Route::get('unread-count', [ChatController::class, 'unreadCount']);
        });

        // ---- Notifications ----
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::post('{id}/read', [NotificationController::class, 'markAsRead']);
            Route::post('read-all', [NotificationController::class, 'markAllAsRead']);
            Route::get('unread-count', [NotificationController::class, 'unreadCount']);
        });

        // ---- Search ----
        Route::prefix('search')->group(function () {
            Route::get('/', [SearchController::class, 'search']);
            Route::post('advanced', [SearchController::class, 'advanced']);
        });

        // ---- Activity Logs (Supervisor only) ----
        Route::prefix('logs')->middleware(['role:supervisor'])->group(function () {
            Route::get('/', [ActivityLogController::class, 'index']);
            Route::get('stats', [ActivityLogController::class, 'stats']);
            Route::get('{id}', [ActivityLogController::class, 'show']);
        });
    });
});
