-- =============================================
-- تلفزيون فلسطين - Palestine TV
-- Supabase Database Migration
-- Initial Schema Setup
-- Execute this in Supabase SQL Editor
-- =============================================

-- 0. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Offices (المكاتب)
CREATE TABLE IF NOT EXISTS offices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar TEXT NOT NULL,
    name_en TEXT,
    type TEXT NOT NULL CHECK (type IN ('main', 'branch')),
    location TEXT,
    phone TEXT,
    email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 2. Departments (الدوائر)
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
    name_ar TEXT NOT NULL,
    name_en TEXT,
    code TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    UNIQUE(code)
);

CREATE INDEX IF NOT EXISTS idx_departments_office ON departments(office_id, is_active);

-- 3. Roles (الأدوار)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    label_ar TEXT NOT NULL,
    label_en TEXT,
    level INTEGER NOT NULL CHECK (level >= 1 AND level <= 4),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Users (المستخدمون)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_number TEXT NOT NULL UNIQUE,
    full_name_ar TEXT NOT NULL,
    full_name_en TEXT,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    password TEXT NOT NULL,
    office_id UUID NOT NULL REFERENCES offices(id),
    department_id UUID NOT NULL REFERENCES departments(id),
    role_id UUID NOT NULL REFERENCES roles(id),
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    job_title_ar TEXT NOT NULL,
    job_title_en TEXT,
    avatar TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    email_verified_at TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    last_login_ip TEXT,
    locale TEXT DEFAULT 'ar',
    remember_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_office_dept_role ON users(office_id, department_id, role_id);
CREATE INDEX IF NOT EXISTS idx_users_employee_number ON users(employee_number);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 5. Permissions (الصلاحيات)
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    label_ar TEXT NOT NULL,
    label_en TEXT,
    group_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Role-Permission Pivot
CREATE TABLE IF NOT EXISTS role_permission (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 7. Official Documents (الكتب الرسمية)
CREATE TABLE IF NOT EXISTS official_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_number TEXT NOT NULL UNIQUE,
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    office_id UUID NOT NULL REFERENCES offices(id),
    department_id UUID REFERENCES departments(id),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent', 'very_urgent')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'in_progress', 'completed', 'archived', 'rejected')),
    rejection_reason TEXT,
    sent_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_documents_sender_receiver ON official_documents(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON official_documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_priority ON official_documents(priority);
CREATE INDEX IF NOT EXISTS idx_documents_number ON official_documents(document_number);

-- 8. Document Attachments (المرفقات)
CREATE TABLE IF NOT EXISTS document_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES official_documents(id) ON DELETE CASCADE,
    original_name TEXT NOT NULL,
    stored_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    extension TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Document Trails (سجل حركة الكتاب)
CREATE TABLE IF NOT EXISTS document_trails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES official_documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    action TEXT NOT NULL CHECK (action IN ('created', 'sent', 'received', 'viewed', 'approved', 'rejected', 'returned', 'in_progress', 'completed', 'archived', 'attachment_added', 'attachment_removed')),
    notes TEXT,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trails_document_user ON document_trails(document_id, user_id, action);
CREATE INDEX IF NOT EXISTS idx_trails_created ON document_trails(created_at);

-- 10. Chat Rooms (غرف الدردشة)
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('department', 'office', 'top_management', 'direct')),
    name_ar TEXT NOT NULL,
    name_en TEXT,
    office_id UUID REFERENCES offices(id),
    department_id UUID REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_rooms_type_office_dept ON chat_rooms(type, office_id, department_id);

-- 11. Chat Room Users Pivot
CREATE TABLE IF NOT EXISTS chat_room_user (
    chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT false,
    PRIMARY KEY (chat_room_id, user_id)
);

-- 12. Messages (الرسائل)
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    body TEXT,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'system')),
    file_path TEXT,
    file_name TEXT,
    file_type TEXT,
    file_size INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_messages_room_created ON messages(chat_room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);

-- 13. Message Reads (قراءة الرسائل)
CREATE TABLE IF NOT EXISTS message_reads (
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (message_id, user_id)
);

-- 14. Notifications (الإشعارات)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT,
    body_ar TEXT NOT NULL,
    body_en TEXT,
    type TEXT NOT NULL,
    reference_type TEXT,
    reference_id TEXT,
    data JSONB,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read_at NULLS FIRST, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- 15. Activity Logs (سجل العمليات)
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    description_en TEXT,
    entity_type TEXT,
    entity_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    method TEXT,
    route TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_user_action ON activity_logs(user_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_created ON activity_logs(created_at DESC);

-- =============================================
-- Realtime Configuration
-- =============================================

-- Enable Realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Function: handle new message notifications
CREATE OR REPLACE FUNCTION handle_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE chat_rooms SET updated_at = NOW() WHERE id = NEW.chat_room_id;
    INSERT INTO notifications (id, user_id, created_by, title_ar, body_ar, type, reference_type, reference_id, data, created_at)
    SELECT
        gen_random_uuid(),
        cru.user_id,
        NEW.sender_id,
        'رسالة جديدة',
        LEFT(NEW.body, 100),
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
    WHERE cru.chat_room_id = NEW.chat_room_id AND cru.user_id != NEW.sender_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_message();

-- Function: handle document status change notifications
CREATE OR REPLACE FUNCTION handle_document_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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
            jsonb_build_object('document_number', NEW.document_number, 'sender_name', (SELECT full_name_ar FROM users WHERE id = NEW.sender_id)),
            NOW()
        );
    END IF;
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
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
            jsonb_build_object('document_number', NEW.document_number),
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
    EXECUTE FUNCTION handle_document_status_change();

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE official_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create admin role policy (full access for service_role)
CREATE POLICY admin_all ON offices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY admin_all ON departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY admin_all ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY admin_all ON official_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY admin_all ON document_attachments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY admin_all ON document_trails FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY admin_all ON chat_rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY admin_all ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY admin_all ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY admin_all ON activity_logs FOR ALL USING (true) WITH CHECK (true);

-- Authenticated users can read their own data
CREATE POLICY users_read_own ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY notifications_read_own ON notifications FOR SELECT USING (user_id = auth.uid());
