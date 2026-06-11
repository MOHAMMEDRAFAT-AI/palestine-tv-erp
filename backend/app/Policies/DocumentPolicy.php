<?php

namespace App\Policies;

use App\Models\OfficialDocument;
use App\Models\User;

class DocumentPolicy
{
    public function view(User $user, OfficialDocument $document): bool
    {
        if ($user->isSupervisor()) return true;

        if ($user->isGeneralManager()) {
            return $document->office_id === $user->office_id;
        }

        if ($user->isDepartmentManager()) {
            return $document->department_id === $user->department_id ||
                $document->sender_id === $user->id ||
                $document->receiver_id === $user->id;
        }

        return $document->sender_id === $user->id ||
            $document->receiver_id === $user->id;
    }

    public function create(User $user): bool
    {
        return in_array($user->role->name, [
            'supervisor', 'general_manager', 'department_manager', 'employee',
        ]);
    }

    public function update(User $user, OfficialDocument $document): bool
    {
        if ($document->isDraft() && $document->sender_id === $user->id) {
            return true;
        }

        if ($user->isSupervisor()) return true;

        return false;
    }

    public function delete(User $user, OfficialDocument $document): bool
    {
        if ($document->isDraft() && $document->sender_id === $user->id) {
            return true;
        }

        return $user->isSupervisor();
    }

    public function approve(User $user, OfficialDocument $document): bool
    {
        if ($document->receiver_id === $user->id && $document->canBeApproved()) {
            return true;
        }

        return $user->isSupervisor();
    }

    public function send(User $user, OfficialDocument $document): bool
    {
        return $document->sender_id === $user->id && $document->canBeSent();
    }
}
