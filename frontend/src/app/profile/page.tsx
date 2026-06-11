'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name_ar: user?.full_name_ar || '',
    phone: user?.phone || '',
    locale: user?.locale || 'ar',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [saving, setSaving] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const form = new FormData();
      form.append('full_name_ar', formData.full_name_ar);
      form.append('phone', formData.phone);
      form.append('locale', formData.locale);
      form.append('_method', 'PUT');
      const res = await api.updateProfile(form);
      setUser(res.data.data);
      toast.success('تم تحديث الملف الشخصي');
      setEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل التحديث');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }
    setSaving(true);
    try {
      await api.changePassword(passwordData);
      toast.success('تم تغيير كلمة المرور');
      setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل تغيير كلمة المرور');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">الملف الشخصي</h1>
          <p className="page-subtitle">عرض وتعديل بياناتك الشخصية</p>
        </div>
      </div>

      {/* Profile Info */}
      <div className="card p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="text-green-700 font-bold text-2xl">{user.full_name_ar.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user.full_name_ar}</h2>
            <p className="text-gray-500">{user.job_title_ar}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <span className="badge bg-green-100 text-green-700">{user.role?.label_ar}</span>
              <span className="badge bg-blue-100 text-blue-700">{user.employee_number}</span>
              <span className="badge bg-gray-100 text-gray-700">{user.office?.name_ar}</span>
              <span className="badge bg-gray-100 text-gray-700">{user.department?.name_ar}</span>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} className="btn btn-outline">
            {editing ? 'إلغاء' : 'تعديل'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">البريد الإلكتروني</p>
            <p className="text-sm font-medium text-gray-900">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">رقم الجوال</p>
            <p className="text-sm font-medium text-gray-900">{user.phone || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">المدير المباشر</p>
            <p className="text-sm font-medium text-gray-900">{user.manager?.full_name_ar || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">آخر تسجيل دخول</p>
            <p className="text-sm font-medium text-gray-900">
              {user.last_login_at ? formatDate(user.last_login_at, 'datetime') : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {editing && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">تعديل الملف الشخصي</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                <input type="text" className="input" value={formData.full_name_ar}
                  onChange={(e) => setFormData({ ...formData, full_name_ar: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الجوال</label>
                <input type="text" className="input" value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </form>
        </div>
      )}

      {/* Change Password */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">تغيير كلمة المرور</h3>
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الحالية</label>
            <input type="password" className="input" required value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور الجديدة</label>
            <input type="password" className="input" required minLength={8} value={passwordData.new_password}
              onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تأكيد كلمة المرور الجديدة</label>
            <input type="password" className="input" required minLength={8} value={passwordData.new_password_confirmation}
              onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })} />
          </div>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
          </button>
        </form>
      </div>
    </div>
  );
}
