<?php

namespace App\Services;

use App\Models\ChatRoom;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ChatService
{
    public function getOrCreateDepartmentChat(string $departmentId): ChatRoom
    {
        return ChatRoom::firstOrCreate(
            [
                'type' => 'department',
                'department_id' => $departmentId,
            ],
            [
                'name_ar' => 'دردشة الدائرة',
                'office_id' => auth()->user()->office_id,
            ]
        );
    }

    public function getOrCreateOfficeChat(string $officeId): ChatRoom
    {
        return ChatRoom::firstOrCreate(
            [
                'type' => 'office',
                'office_id' => $officeId,
            ],
            [
                'name_ar' => 'دردشة المكتب',
            ]
        );
    }

    public function getOrCreateTopManagementChat(): ChatRoom
    {
        return ChatRoom::firstOrCreate(
            ['type' => 'top_management'],
            ['name_ar' => 'دردشة الإدارة العليا']
        );
    }

    public function sendMessage(ChatRoom $room, User $sender, string $body = null, string $type = 'text', UploadedFile $file = null): Message
    {
        $data = [
            'chat_room_id' => $room->id,
            'sender_id' => $sender->id,
            'body' => $body,
            'type' => $type,
        ];

        if ($file) {
            $path = $file->store('chat/' . $room->id, 'public');
            $data['file_path'] = $path;
            $data['file_name'] = $file->getClientOriginalName();
            $data['file_type'] = $file->getMimeType();
            $data['file_size'] = $file->getSize();
            $data['type'] = str_starts_with($file->getMimeType(), 'image/') ? 'image' : 'file';
        }

        return Message::create($data);
    }

    public function markAsRead(ChatRoom $room, User $user): void
    {
        DB::table('chat_room_user')
            ->where('chat_room_id', $room->id)
            ->where('user_id', $user->id)
            ->update(['last_read_at' => now()]);
    }

    public function getUnreadCount(User $user): int
    {
        return Message::whereIn('chat_room_id', $user->chatRooms()->pluck('chat_room_id'))
            ->where('sender_id', '!=', $user->id)
            ->whereDoesntHave('reads', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->count();
    }

    public function getAccessibleRooms(User $user)
    {
        $query = ChatRoom::query();

        if ($user->isSupervisor()) {
            $query->whereIn('type', ['top_management', 'office']);
        } elseif ($user->isGeneralManager()) {
            $query->where(function ($q) use ($user) {
                $q->where('type', 'top_management')
                    ->orWhere(function ($sub) use ($user) {
                        $sub->where('type', 'office')
                            ->where('office_id', $user->office_id);
                    });
            });
        } elseif ($user->isDepartmentManager()) {
            $query->where(function ($q) use ($user) {
                $q->where('type', 'department')
                    ->where('department_id', $user->department_id)
                    ->orWhere(function ($sub) use ($user) {
                        $sub->where('type', 'office')
                            ->where('office_id', $user->office_id);
                    });
            });
        } else {
            $query->where('type', 'department')
                ->where('department_id', $user->department_id);
        }

        return $query->with(['users' => function ($q) {
            $q->select('id', 'full_name_ar', 'avatar');
        }])->withCount('messages')->get();
    }

    public function getMessages(ChatRoom $room, User $user, int $perPage = 50)
    {
        $this->validateAccess($room, $user);

        $this->markAsRead($room, $user);

        return $room->messages()
            ->with(['sender' => function ($q) {
                $q->select('id', 'full_name_ar', 'avatar');
            }, 'reads'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    private function validateAccess(ChatRoom $room, User $user): void
    {
        $hasAccess = match ($room->type) {
            'department' => $room->department_id === $user->department_id,
            'office' => $room->office_id === $user->office_id,
            'top_management' => $user->isSupervisor() || $user->isGeneralManager(),
            default => false,
        };

        if (!$hasAccess) {
            throw new \DomainException('ليس لديك صلاحية للوصول إلى هذه الدردشة.');
        }
    }
}
