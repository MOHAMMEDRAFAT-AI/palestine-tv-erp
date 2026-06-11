-- =============================================
-- Supabase Realtime Configuration for Chat
-- Execute this in Supabase SQL Editor
-- =============================================

-- Enable Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable Realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Create function for new message notifications
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    -- Update chat room's updated_at
    UPDATE chat_rooms
    SET updated_at = NOW()
    WHERE id = NEW.chat_room_id;

    -- Create notifications for room members except sender
    INSERT INTO notifications (id, user_id, created_by, title_ar, body_ar, type, reference_type, reference_id, data, created_at)
    SELECT
        gen_random_uuid(),
        cru.user_id,
        NEW.sender_id,
        'رسالة جديدة',
        SUBSTRING(NEW.body FROM 1 FOR 100),
        'new_message',
        'chat',
        NEW.chat_room_id,
        jsonb_build_object(
            'message_id', NEW.id,
            'chat_room_id', NEW.chat_room_id,
            'sender_name', (SELECT full_name_ar FROM users WHERE id = NEW.sender_id)
        ),
        NOW()
    FROM chat_room_user cru
    WHERE cru.chat_room_id = NEW.chat_room_id
      AND cru.user_id != NEW.sender_id;

    RETURN NEW;
END;
$$;

-- Create trigger for new messages
CREATE TRIGGER on_new_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_message();

-- Create function for document status notifications
CREATE OR REPLACE FUNCTION public.handle_document_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    IF NEW.status = 'sent' AND OLD.status = 'draft' THEN
        INSERT INTO notifications (id, user_id, created_by, title_ar, body_ar, type, reference_type, reference_id, data, created_at)
        VALUES (
            gen_random_uuid(),
            NEW.receiver_id,
            NEW.sender_id,
            'كتاب رسمي جديد',
            'وصلتك كتاب رسمي جديد: ' || NEW.title,
            'document_received',
            'document',
            NEW.id,
            jsonb_build_object(
                'document_number', NEW.document_number,
                'sender_name', (SELECT full_name_ar FROM users WHERE id = NEW.sender_id)
            ),
            NOW()
        );
    END IF;

    IF NEW.status = 'completed' THEN
        INSERT INTO notifications (id, user_id, created_by, title_ar, body_ar, type, reference_type, reference_id, data, created_at)
        VALUES (
            gen_random_uuid(),
            NEW.sender_id,
            NEW.receiver_id,
            'تم اعتماد الكتاب',
            'تم اعتماد الكتاب: ' || NEW.title,
            'document_approved',
            'document',
            NEW.id,
            jsonb_build_object(
                'document_number', NEW.document_number
            ),
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_document_status_change
    AFTER UPDATE OF status ON official_documents
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.handle_document_status_change();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_room_created
    ON messages (chat_room_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read
    ON notifications (user_id, read_at NULLS FIRST, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_trails_document
    ON document_trails (document_id, created_at DESC);
