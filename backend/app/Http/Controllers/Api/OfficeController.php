<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Office;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class OfficeController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $offices = Office::where('is_active', true)->get(['id', 'name_ar', 'name_en', 'type', 'location']);
        return $this->success($offices);
    }
}
