<?php

namespace App\Services;

use App\Models\DocumentTrail;
use App\Models\Notification;
use App\Models\OfficialDocument;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class DocumentService
{
    public function create(array $data, User $sender): OfficialDocument
    {
        return DB::transaction(function () use ($data, $sender) {
            $data['sender_id'] = $sender->id;
            $data['office_id'] = $sender->office_id;
            $data['department_id'] = $sender->department_id;
            $data['document_number'] = OfficialDocument::generateDocumentNumber();
            $data['status'] = 'draft';

            $document = OfficialDocument::create($data);

            $this->logTrail($document, $sender, 'created', 'تم إنشاء الكتاب');

            return $document;
        });
    }

    public function send(OfficialDocument $document, User $sender): OfficialDocument
    {
        $this->validateSendPermission($document, $sender);

        return DB::transaction(function () use ($document, $sender) {
            $document->update([
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            $this->logTrail($document, $sender, 'sent', 'تم إرسال الكتاب');

            $this->sendNotification(
                $document->receiver,
                'document_received',
                'كتاب رسمي جديد',
                "وصلتك كتاب رسمي جديد بعنوان: {$document->title}",
                $document
            );

            return $document->fresh();
        });
    }

    public function receive(OfficialDocument $document, User $receiver): OfficialDocument
    {
        return DB::transaction(function () use ($document, $receiver) {
            $document->update([
                'status' => 'received',
                'received_at' => now(),
            ]);

            $this->logTrail($document, $receiver, 'received', 'تم استلام الكتاب');

            return $document->fresh();
        });
    }

    public function approve(OfficialDocument $document, User $approver, ?string $notes = null): OfficialDocument
    {
        $this->validateApprovePermission($document, $approver);

        return DB::transaction(function () use ($document, $approver, $notes) {
            $document->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            $this->logTrail($document, $approver, 'approved', $notes ?? 'تم اعتماد الكتاب');

            $this->sendNotification(
                $document->sender,
                'document_approved',
                'تم اعتماد الكتاب',
                "تم اعتماد الكتاب \"{$document->title}\"",
                $document
            );

            return $document->fresh();
        });
    }

    public function reject(OfficialDocument $document, User $rejector, string $reason): OfficialDocument
    {
        $this->validateApprovePermission($document, $rejector);

        return DB::transaction(function () use ($document, $rejector, $reason) {
            $document->update([
                'status' => 'rejected',
                'rejection_reason' => $reason,
            ]);

            $this->logTrail($document, $rejector, 'rejected', "تم رفض الكتاب - السبب: {$reason}");

            $this->sendNotification(
                $document->sender,
                'document_rejected',
                'تم رفض الكتاب',
                "تم رفض الكتاب \"{$document->title}\" - السبب: {$reason}",
                $document
            );

            return $document->fresh();
        });
    }

    public function returnToSender(OfficialDocument $document, User $returner, string $notes): OfficialDocument
    {
        return DB::transaction(function () use ($document, $returner, $notes) {
            $document->update([
                'status' => 'draft',
                'rejection_reason' => $notes,
            ]);

            $this->logTrail($document, $returner, 'returned', "تم إعادة الكتاب مع ملاحظات: {$notes}");

            $this->sendNotification(
                $document->sender,
                'document_returned',
                'تم إعادة الكتاب',
                "تم إعادة الكتاب \"{$document->title}\" مع ملاحظات: {$notes}",
                $document
            );

            return $document->fresh();
        });
    }

    public function archive(OfficialDocument $document, User $user): OfficialDocument
    {
        return DB::transaction(function () use ($document, $user) {
            $document->update(['status' => 'archived']);

            $this->logTrail($document, $user, 'archived', 'تم أرشفة الكتاب');

            return $document->fresh();
        });
    }

    public function addAttachment(OfficialDocument $document, UploadedFile $file, User $user): void
    {
        $path = $file->store('attachments/' . $document->id, 'public');

        $document->attachments()->create([
            'original_name' => $file->getClientOriginalName(),
            'stored_path' => $path,
            'mime_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'extension' => $file->getClientOriginalExtension(),
        ]);

        $this->logTrail($document, $user, 'attachment_added', "تم إضافة مرفق: {$file->getClientOriginalName()}");
    }

    private function validateSendPermission(OfficialDocument $document, User $sender): void
    {
        $receiver = $document->receiver;

        $validHierarchy = match ($sender->role->name) {
            Role::EMPLOYEE => $receiver->isDepartmentManager() && $receiver->department_id === $sender->department_id,
            Role::DEPARTMENT_MANAGER => $receiver->isGeneralManager() && $receiver->office_id === $sender->office_id,
            Role::GENERAL_MANAGER => $receiver->isSupervisor(),
            Role::SUPERVISOR => true, // can send to anyone
            default => false,
        };

        if (!$validHierarchy) {
            throw new \DomainException('لا يمكن إرسال الكتاب إلى هذا المستوى الإداري. يجب اتباع التسلسل الإداري.');
        }
    }

    private function validateApprovePermission(OfficialDocument $document, User $approver): void
    {
        $isReceiver = $document->receiver_id === $approver->id;
        $isSupervisor = $approver->isSupervisor();

        if (!$isReceiver && !$isSupervisor) {
            throw new \DomainException('ليس لديك صلاحية اعتماد أو رفض هذا الكتاب.');
        }
    }

    private function logTrail(OfficialDocument $document, User $user, string $action, ?string $notes = null): void
    {
        DocumentTrail::create([
            'document_id' => $document->id,
            'user_id' => $user->id,
            'action' => $action,
            'notes' => $notes,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => [
                'user_role' => $user->role->name,
                'user_office' => $user->office_id,
                'document_status' => $document->status,
            ],
        ]);
    }

    private function sendNotification(User $user, string $type, string $title, string $body, OfficialDocument $document): void
    {
        Notification::create([
            'user_id' => $user->id,
            'created_by' => auth()->id(),
            'title_ar' => $title,
            'body_ar' => $body,
            'type' => $type,
            'reference_type' => 'document',
            'reference_id' => $document->id,
            'data' => [
                'document_number' => $document->document_number,
                'document_id' => $document->id,
                'sender_name' => $document->sender->full_name_ar,
            ],
        ]);
    }

    public function getDocumentsForUser(User $user, array $filters = [])
    {
        $query = OfficialDocument::query();

        if ($user->isSupervisor()) {
            // Can see all documents
        } elseif ($user->isGeneralManager()) {
            $query->where(function ($q) use ($user) {
                $q->where('office_id', $user->office_id)
                    ->where(function ($sub) use ($user) {
                        $sub->where('sender_id', $user->id)
                            ->orWhere('receiver_id', $user->id);
                    });
            });
        } elseif ($user->isDepartmentManager()) {
            $query->where(function ($q) use ($user) {
                $q->where('department_id', $user->department_id)
                    ->where(function ($sub) use ($user) {
                        $sub->where('sender_id', $user->id)
                            ->orWhere('receiver_id', $user->id)
                            ->orWhereIn('sender_id', $user->subordinates()->pluck('id'))
                            ->orWhereIn('receiver_id', $user->subordinates()->pluck('id'));
                    });
            });
        } else {
            $query->where(function ($q) use ($user) {
                $q->where('sender_id', $user->id)
                    ->orWhere('receiver_id', $user->id);
            });
        }

        return $query->filter($filters)
            ->sort($filters['sort_by'] ?? null, $filters['sort_dir'] ?? null)
            ->paginate($filters['per_page'] ?? 15);
    }
}
