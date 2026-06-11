<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ChatService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    use ApiResponse;

    public function __construct(private ChatService $chatService) {}

    public function rooms(): JsonResponse
    {
        $rooms = $this->chatService->getAccessibleRooms(auth()->user());

        return $this->success($rooms);
    }

    public function messages(string $roomId, Request $request): JsonResponse
    {
        $room = \App\Models\ChatRoom::findOrFail($roomId);

        try {
            $messages = $this->chatService->getMessages(
                $room,
                auth()->user(),
                $request->per_page ?? 50
            );

            $messages->load(['sender' => function ($q) {
                $q->select('id', 'full_name_ar', 'avatar');
            }]);

            return $this->paginated($messages);
        } catch (\DomainException $e) {
            return $this->error($e->getMessage(), 403);
        }
    }

    public function send(Request $request, string $roomId): JsonResponse
    {
        $room = \App\Models\ChatRoom::findOrFail($roomId);

        $validator = Validator::make($request->all(), [
            'body' => 'required_without:file|string',
            'file' => 'required_without:body|file|max:20480',
        ]);

        if ($validator->fails()) {
            return $this->error('بيانات غير صحيحة', 422, $validator->errors());
        }

        try {
            $message = $this->chatService->sendMessage(
                $room,
                auth()->user(),
                $request->body,
                'text',
                $request->file('file')
            );

            return $this->created(
                $message->load('sender:id,full_name_ar,avatar'),
                'تم إرسال الرسالة'
            );
        } catch (\DomainException $e) {
            return $this->error($e->getMessage(), 403);
        }
    }

    public function markRead(string $roomId): JsonResponse
    {
        $room = \App\Models\ChatRoom::findOrFail($roomId);

        $this->chatService->markAsRead($room, auth()->user());

        return $this->success(null, 'تم تحديث حالة القراءة');
    }

    public function unreadCount(): JsonResponse
    {
        $count = $this->chatService->getUnreadCount(auth()->user());

        return $this->success(['count' => $count]);
    }
}
