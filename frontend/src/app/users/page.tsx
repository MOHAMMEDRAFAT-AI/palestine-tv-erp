'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const { user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [offices, setOffices] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    employee_number: '',
    full_name_ar: '',
    email: '',
    phone: '',
    password: '',
    office_id: '',
    department_id: '',
    role_id: '',
    manager_id: '',
    job_title_ar: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, officesRes, rolesRes] = await Promise.all([
          api.getUsers({ per_page: 50 }),
          api.get('/offices'),
          api.get('/roles'),
        ]);
        setUsers(usersRes.data.data);
        setOffices(officesRes.data.data || []);
        setRoles(rolesRes.data.data || []);
      } catch {
        toast.error('فشل تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const loadDepartments = async (officeId: string) => {
    try {
      const res = await api.get(`/departments?office_id=${officeId}`);
      setDepartments(res.data.data || []);
    } catch {}
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.createUser(formData);
      setUsers((prev) => [res.data.data, ...prev]);
      toast.success('تم إنشاء المستخدم بنجاح');
      setShowCreateModal(false);
      setFormData({
        employee_number: '', full_name_ar: '', email: '', phone: '',
        password: '', office_id: '', department_id: '', role_id: '',
        manager_id: '', job_title_ar: '',
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل إنشاء المستخدم');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${name}"؟`)) return;
    try {
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('تم حذف المستخدم');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'فشل حذف المستخدم');
    }
  };

  const canCreate = user?.role?.name === 'supervisor' || user?.role?.name === 'general_manager';

  const filteredUsers = users.filter((u) =>
    u.full_name_ar?.includes(search) || u.employee_number?.includes(search) || u.email?.includes(search)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">المستخدمون</h1>
          <p className="page-subtitle">إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            مستخدم جديد
          </button>
        )}
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input max-w-md"
        placeholder="بحث باسم الموظف أو الرقم الوظيفي..."
      />

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>الموظف</th>
              <th>الرقم الوظيفي</th>
              <th>البريد الإلكتروني</th>
              <th>المسمى الوظيفي</th>
              <th>الدور</th>
              <th>المكتب</th>
              <th>الحالة</th>
              {canCreate && <th></th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(canCreate ? 8 : 7)].map((_, j) => (
                    <td key={j}><div className="skeleton h-5 w-24" /></td>
                  ))}
                </tr>
              ))
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={canCreate ? 8 : 7} className="text-center py-12 text-gray-400">لا يوجد مستخدمون</td></tr>
            ) : (
              filteredUsers.map((u: any) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-green-700">{u.full_name_ar?.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{u.full_name_ar}</span>
                    </div>
                  </td>
                  <td className="text-sm font-mono">{u.employee_number}</td>
                  <td className="text-sm text-gray-600">{u.email}</td>
                  <td className="text-sm">{u.job_title_ar}</td>
                  <td><span className="badge bg-blue-100 text-blue-700">{u.role?.label_ar}</span></td>
                  <td className="text-sm text-gray-600">{u.office?.name_ar}</td>
                  <td>
                    <span className={cn('badge', u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                      {u.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  {canCreate && (
                    <td>
                      <button onClick={() => handleDeleteUser(u.id, u.full_name_ar)} className="text-red-500 hover:text-red-700 text-sm">
                        حذف
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-6">إنشاء مستخدم جديد</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
                  <input type="text" className="input" required value={formData.full_name_ar}
                    onChange={(e) => setFormData({ ...formData, full_name_ar: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الرقم الوظيفي *</label>
                  <input type="text" className="input" required value={formData.employee_number}
                    onChange={(e) => setFormData({ ...formData, employee_number: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني *</label>
                  <input type="email" className="input" required value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم الجوال</label>
                  <input type="text" className="input" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور *</label>
                  <input type="password" className="input" required value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المسمى الوظيفي *</label>
                  <input type="text" className="input" required value={formData.job_title_ar}
                    onChange={(e) => setFormData({ ...formData, job_title_ar: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المكتب *</label>
                  <select className="select" required value={formData.office_id}
                    onChange={(e) => { setFormData({ ...formData, office_id: e.target.value, department_id: '' }); loadDepartments(e.target.value); }}>
                    <option value="">اختر المكتب</option>
                    {offices.map((o: any) => <option key={o.id} value={o.id}>{o.name_ar}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الدائرة *</label>
                  <select className="select" required value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}>
                    <option value="">اختر الدائرة</option>
                    {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name_ar}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الدور *</label>
                  <select className="select" required value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}>
                    <option value="">اختر الدور</option>
                    {roles.map((r: any) => <option key={r.id} value={r.id}>{r.label_ar}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-outline">إلغاء</button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
