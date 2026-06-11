'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [locale, setLocale] = useState(user?.locale || 'ar');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const form = new FormData();
      form.append('locale', locale);
      form.append('_method', 'PUT');
      await api.updateProfile(form);
      toast.success('تم حفظ الإعدادات');
    } catch {
      toast.error('فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">الإعدادات</h1>
          <p className="page-subtitle">إعدادات النظام والتفضيلات</p>
        </div>
      </div>

      <div className="card p-6 space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-4">اللغة</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="locale" value="ar" checked={locale === 'ar'}
                onChange={(e) => setLocale(e.target.value)} className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">العربية</p>
                <p className="text-xs text-gray-500">الواجهة باللغة العربية</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="locale" value="en" checked={locale === 'en'}
                onChange={(e) => setLocale(e.target.value)} className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900">English</p>
                <p className="text-xs text-gray-500">Interface in English</p>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <button onClick={handleSave} disabled={saving} className="btn btn-primary">
            {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">معلومات الحساب</h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">الدور</span>
            <span className="text-sm font-medium">{user?.role?.label_ar}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">المكتب</span>
            <span className="text-sm font-medium">{user?.office?.name_ar}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">الدائرة</span>
            <span className="text-sm font-medium">{user?.department?.name_ar}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-gray-500">حالة الحساب</span>
            <span className={`badge ${user?.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {user?.status === 'active' ? 'نشط' : 'غير نشط'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
