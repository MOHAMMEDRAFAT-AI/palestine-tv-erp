'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';

export default function NewDocumentPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    receiver_id: '',
    title: '',
    body: '',
    priority: 'normal',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.getUsers({ per_page: 100 });
        setUsers(res.data.data);
      } catch {}
    };
    fetchUsers();
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getAvailableReceivers = () => {
    if (!user || !user.role) return [];
    const role = user.role.name;

    if (role === 'supervisor') return users;

    if (role === 'general_manager') {
      return users.filter((u) => u.role?.name === 'supervisor');
    }

    if (role === 'department_manager') {
      return users.filter(
        (u) => u.role?.name === 'general_manager' && u.office_id === user.office_id
      );
    }

    if (role === 'employee') {
      return users.filter(
        (u) =>
          u.role?.name === 'department_manager' &&
          u.department_id === user.department_id
      );
    }

    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.receiver_id) {
      toast.error('الرجاء اختيار المستلم');
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();
      data.append('receiver_id', formData.receiver_id);
      data.append('title', formData.title);
      data.append('body', formData.body);
      data.append('priority', formData.priority);
      files.forEach((file) => data.append('attachments[]', file));

      const res = await api.createDocument(data);
      toast.success('تم إنشاء الكتاب بنجاح');
      router.push(`/documents/${res.data.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل إنشاء الكتاب');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">كتاب رسمي جديد</h1>
          <p className="page-subtitle">إنشاء كتاب رسمي جديد مع اتباع التسلسل الإداري</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* Receiver */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">المستلم *</label>
          <select
            className="select"
            required
            value={formData.receiver_id}
            onChange={(e) => setFormData({ ...formData, receiver_id: e.target.value })}
          >
            <option value="">اختر المستلم</option>
            {getAvailableReceivers().map((u: any) => (
              <option key={u.id} value={u.id}>
                {u.full_name_ar} - {u.job_title_ar}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            يمكنك إرسال الكتاب إلى المستوى الإداري الأعلى فقط حسب التسلسل الإداري
          </p>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
          <select
            className="select"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          >
            <option value="normal">عادية</option>
            <option value="important">مهمة</option>
            <option value="urgent">عاجلة</option>
            <option value="very_urgent">عاجلة جداً</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الكتاب *</label>
          <input
            type="text"
            className="input"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="أدخل عنوان الكتاب..."
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">نص الكتاب *</label>
          <textarea
            className="textarea min-h-[200px]"
            required
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            placeholder="أدخل نص الكتاب..."
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">المرفقات (اختياري)</label>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'border-green-500 bg-green-50' : ''}`}
          >
            <input {...getInputProps()} />
            <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-500">اسحب وأفلت الملفات هنا أو انقر للاختيار</p>
            <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, صور - حد أقصى 10MB</p>
          </div>

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <span className="text-lg">📎</span>
                  <span className="text-sm flex-1">{file.name}</span>
                  <span className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                  <button type="button" onClick={() => removeFile(index)} className="text-red-500 text-sm">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
          <button type="button" onClick={() => router.back()} className="btn btn-outline">إلغاء</button>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="spinner !w-4 !h-4 !border-2 !border-white/30 !border-t-white" />
                جاري الإنشاء...
              </span>
            ) : (
              'إنشاء الكتاب'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
