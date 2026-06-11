export interface Office {
  id: string;
  name_ar: string;
  name_en: string | null;
  type: 'main' | 'branch';
  location: string | null;
  is_active: boolean;
}

export interface Department {
  id: string;
  office_id: string;
  name_ar: string;
  name_en: string | null;
  code: string;
  description: string | null;
  is_active: boolean;
  office?: Office;
}

export interface Role {
  id: string;
  name: 'supervisor' | 'general_manager' | 'department_manager' | 'employee';
  label_ar: string;
  label_en: string | null;
  level: 1 | 2 | 3 | 4;
}

export interface User {
  id: string;
  employee_number: string;
  full_name_ar: string;
  full_name_en: string | null;
  email: string;
  phone: string | null;
  office_id: string;
  department_id: string;
  role_id: string;
  manager_id: string | null;
  job_title_ar: string;
  job_title_en: string | null;
  avatar: string | null;
  status: 'active' | 'inactive' | 'suspended';
  locale: string;
  last_login_at: string | null;
  office?: Office;
  department?: Department;
  role?: Role;
  manager?: Pick<User, 'id' | 'full_name_ar' | 'job_title_ar' | 'avatar'>;
  subordinates?: Pick<User, 'id' | 'full_name_ar' | 'employee_number' | 'job_title_ar' | 'avatar'>[];
  created_at: string;
}

export type DocumentPriority = 'normal' | 'important' | 'urgent' | 'very_urgent';
export type DocumentStatus = 'draft' | 'sent' | 'received' | 'in_progress' | 'completed' | 'archived' | 'rejected';

export interface OfficialDocument {
  id: string;
  document_number: string;
  sender_id: string;
  receiver_id: string;
  office_id: string;
  department_id: string | null;
  title: string;
  body: string;
  priority: DocumentPriority;
  status: DocumentStatus;
  rejection_reason: string | null;
  sent_at: string | null;
  received_at: string | null;
  completed_at: string | null;
  sender?: Pick<User, 'id' | 'full_name_ar' | 'avatar'>;
  receiver?: Pick<User, 'id' | 'full_name_ar' | 'avatar'>;
  office?: Office;
  department?: Department;
  attachments?: DocumentAttachment[];
  trails?: DocumentTrail[];
  created_at: string;
  updated_at: string;
}

export interface DocumentAttachment {
  id: string;
  document_id: string;
  original_name: string;
  stored_path: string;
  mime_type: string;
  file_size: number;
  extension: string;
  created_at: string;
}

export interface DocumentTrail {
  id: string;
  document_id: string;
  user_id: string;
  action: TrailAction;
  notes: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown> | null;
  user?: Pick<User, 'id' | 'full_name_ar' | 'avatar'> & { role?: Role };
  created_at: string;
}

export type TrailAction =
  | 'created' | 'sent' | 'received' | 'viewed'
  | 'approved' | 'rejected' | 'returned'
  | 'in_progress' | 'completed' | 'archived'
  | 'attachment_added' | 'attachment_removed';

export type ChatRoomType = 'department' | 'office' | 'top_management' | 'direct';

export interface ChatRoom {
  id: string;
  type: ChatRoomType;
  name_ar: string;
  name_en: string | null;
  office_id: string | null;
  department_id: string | null;
  is_active: boolean;
  users?: Pick<User, 'id' | 'full_name_ar' | 'avatar'>[];
  last_message?: Message;
  messages_count?: number;
  created_at: string;
}

export interface Message {
  id: string;
  chat_room_id: string;
  sender_id: string;
  body: string | null;
  type: 'text' | 'image' | 'file' | 'system';
  file_path: string | null;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  sender?: Pick<User, 'id' | 'full_name_ar' | 'avatar'>;
  reads?: { id: string; pivot: { read_at: string } }[];
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  created_by: string | null;
  title_ar: string;
  body_ar: string;
  type: string;
  reference_type: string | null;
  reference_id: string | null;
  data: Record<string, unknown> | null;
  read_at: string | null;
  creator?: Pick<User, 'id' | 'full_name_ar' | 'avatar'>;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  description_ar: string;
  description_en: string | null;
  entity_type: string | null;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  method: string | null;
  route: string | null;
  user?: Pick<User, 'id' | 'full_name_ar' | 'employee_number' | 'avatar'>;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
  meta?: PaginatedResponse<T>['meta'];
}

// Priority labels in Arabic
export const PRIORITY_LABELS: Record<DocumentPriority, string> = {
  normal: 'عادية',
  important: 'مهمة',
  urgent: 'عاجلة',
  very_urgent: 'عاجلة جداً',
};

// Priority colors for badges
export const PRIORITY_COLORS: Record<DocumentPriority, string> = {
  normal: 'bg-gray-100 text-gray-800',
  important: 'bg-blue-100 text-blue-800',
  urgent: 'bg-orange-100 text-orange-800',
  very_urgent: 'bg-red-100 text-red-800',
};

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: 'مسودة',
  sent: 'مرسل',
  received: 'مستلم',
  in_progress: 'قيد المتابعة',
  completed: 'منجز',
  archived: 'مؤرشف',
  rejected: 'مرفوض',
};

export const STATUS_COLORS: Record<DocumentStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  received: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-emerald-100 text-emerald-800',
  archived: 'bg-purple-100 text-purple-800',
  rejected: 'bg-red-100 text-red-800',
};
