<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\OfficialDocument;
use App\Services\DocumentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DocumentController extends Controller
{
    use ApiResponse;

    public function __construct(private DocumentService $documentService) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'status', 'priority', 'sender_id', 'receiver_id',
            'department_id', 'office_id', 'title', 'document_number',
            'sort_by', 'sort_dir', 'per_page',
        ]);

        $documents = $this->documentService->getDocumentsForUser(auth()->user(), $filters);

        $documents->load(['sender:id,full_name_ar,avatar', 'receiver:id,full_name_ar,avatar', 'attachments']);

        return $this->paginated($documents);
    }

    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'receiver_id' => 'required|exists:users,id',
            'title' => 'required|string|max:500',
            'body' => 'required|string',
            'priority' => 'sometimes|in:normal,important,urgent,very_urgent',
            'attachments.*' => 'sometimes|file|max:10240',
        ]);

        if ($validator->fails()) {
            return $this->error('بيانات غير صحيحة', 422, $validator->errors());
        }

        try {
            $document = $this->documentService->create($request->all(), $user);

            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $this->documentService->addAttachment($document, $file, $user);
                }
            }

            return $this->created(
                $document->load(['sender', 'receiver', 'attachments']),
                'تم إنشاء الكتاب بنجاح'
            );
        } catch (\DomainException $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function show(string $id): JsonResponse
    {
        $document = OfficialDocument::with([
            'sender:id,full_name_ar,employee_number,avatar',
            'receiver:id,full_name_ar,employee_number,avatar',
            'office', 'department',
            'attachments',
            'trails.user:id,full_name_ar,role_id,avatar',
            'trails.user.role',
        ])->findOrFail($id);

        $this->authorize('view', $document);

        return $this->success($document);
    }

    public function send(string $id): JsonResponse
    {
        $document = OfficialDocument::findOrFail($id);
        $user = auth()->user();

        if ($document->sender_id !== $user->id) {
            return $this->error('يمكنك إرسال كتبك فقط', 403);
        }

        try {
            $document = $this->documentService->send($document, $user);
            return $this->success($document->load(['sender', 'receiver']), 'تم إرسال الكتاب بنجاح');
        } catch (\DomainException $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function receive(string $id): JsonResponse
    {
        $document = OfficialDocument::findOrFail($id);
        $user = auth()->user();

        if ($document->receiver_id !== $user->id) {
            return $this->error('يمكنك استلام كتبك فقط', 403);
        }

        try {
            $document = $this->documentService->receive($document, $user);
            return $this->success($document, 'تم استلام الكتاب بنجاح');
        } catch (\DomainException $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function approve(Request $request, string $id): JsonResponse
    {
        $document = OfficialDocument::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return $this->error('بيانات غير صحيحة', 422, $validator->errors());
        }

        try {
            $document = $this->documentService->approve($document, auth()->user(), $request->notes);
            return $this->success($document, 'تم اعتماد الكتاب بنجاح');
        } catch (\DomainException $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function reject(Request $request, string $id): JsonResponse
    {
        $document = OfficialDocument::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return $this->error('بيانات غير صحيحة', 422, $validator->errors());
        }

        try {
            $document = $this->documentService->reject($document, auth()->user(), $request->reason);
            return $this->success($document, 'تم رفض الكتاب');
        } catch (\DomainException $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function returnToSender(Request $request, string $id): JsonResponse
    {
        $document = OfficialDocument::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'notes' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return $this->error('بيانات غير صحيحة', 422, $validator->errors());
        }

        try {
            $document = $this->documentService->returnToSender($document, auth()->user(), $request->notes);
            return $this->success($document, 'تم إعادة الكتاب إلى المرسل');
        } catch (\DomainException $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function archive(string $id): JsonResponse
    {
        $document = OfficialDocument::findOrFail($id);
        $this->authorize('update', $document);

        try {
            $document = $this->documentService->archive($document, auth()->user());
            return $this->success($document, 'تم أرشفة الكتاب بنجاح');
        } catch (\DomainException $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function uploadAttachment(Request $request, string $id): JsonResponse
    {
        $document = OfficialDocument::findOrFail($id);
        $this->authorize('update', $document);

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240',
        ]);

        if ($validator->fails()) {
            return $this->error('ملف غير صحيح', 422, $validator->errors());
        }

        try {
            $this->documentService->addAttachment($document, $request->file('file'), auth()->user());
            return $this->success($document->fresh()->load('attachments'), 'تم رفع المرفق بنجاح');
        } catch (\DomainException $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    public function trail(string $id): JsonResponse
    {
        $document = OfficialDocument::findOrFail($id);
        $this->authorize('view', $document);

        $trails = $document->trails()->with('user:id,full_name_ar,avatar')->get();

        return $this->success($trails);
    }
}
