'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { PRIORITY_LABELS, PRIORITY_COLORS, STATUS_LABELS, STATUS_COLORS } from '@/types';
import Link from 'next/link';

interface DashboardData {
  total_employees?: number;
  total_documents?: number;
  pending_documents?: number;
  recent_documents?: any[];
  office_stats?: any[];
  department_stats?: any[];
  employee_count?: number;
  incoming_documents?: number;
  outgoing_documents?: number;
  department_performance?: any[];
  my_documents?: number;
  department_documents?: number;
  pending_tasks?: number;
  employees?: any[];
  sent_documents?: number;
  received_documents?: number;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.getDashboard();
        setData(res.data.data);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-4 w-24 mb-3" />
              <div className="skeleton h-8 w-16" />
            </div>
          ))}
        </div>
        <div className="card p-6">
          <div className="skeleton h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const role = user?.role?.name;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">لوحة التحكم</h1>
          <p className="page-subtitle">
            مرحباً بك في نظام تلفزيون فلسطين للإدارة المتكامل
          </p>
        </div>
      </div>

      {/* Supervisor Dashboard */}
      {role === 'supervisor' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="عدد الموظفين"
              value={data.total_employees || 0}
              icon="users"
              color="blue"
            />
            <StatCard
              title="الكتب الرسمية"
              value={data.total_documents || 0}
              icon="document"
              color="green"
            />
            <StatCard
              title="الكتب المعلقة"
              value={data.pending_documents || 0}
              icon="clock"
              color="orange"
            />
            <StatCard
              title="المكاتب"
              value={data.office_stats?.length || 0}
              icon="office"
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">إحصائيات المكاتب</h3>
              <div className="space-y-3">
                {data.office_stats?.map((office: any) => (
                  <div key={office.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{office.name}</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-gray-500">{office.employee_count} موظف</span>
                      <span className="text-gray-500">{office.document_count} كتاب</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">إحصائيات الدوائر</h3>
              <div className="space-y-3">
                {data.department_stats?.map((dept: any) => (
                  <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{dept.name_ar}</span>
                    <span className="text-sm text-gray-500">{dept.employee_count} موظف</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* General Manager Dashboard */}
      {role === 'general_manager' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="عدد الموظفين" value={data.employee_count || 0} icon="users" color="blue" />
            <StatCard title="الكتب الواردة" value={data.incoming_documents || 0} icon="inbox" color="green" />
            <StatCard title="الكتب الصادرة" value={data.outgoing_documents || 0} icon="send" color="purple" />
            <StatCard title="المهام المعلقة" value={data.pending_documents || 0} icon="clock" color="orange" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">أداء الدوائر</h3>
              <div className="space-y-3">
                {data.department_performance?.map((dept: any) => (
                  <div key={dept.name_ar} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{dept.name_ar}</span>
                    <span className="text-sm text-gray-500">{dept.document_count} كتاب</span>
                  </div>
                ))}
              </div>
            </div>

            <RecentDocuments documents={data.recent_documents || []} />
          </div>
        </>
      )}

      {/* Department Manager Dashboard */}
      {role === 'department_manager' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="موظفي الدائرة" value={data.employee_count || 0} icon="users" color="blue" />
            <StatCard title="كتبي" value={data.my_documents || 0} icon="document" color="green" />
            <StatCard title="كتب الدائرة" value={data.department_documents || 0} icon="folder" color="purple" />
            <StatCard title="مهام معلقة" value={data.pending_tasks || 0} icon="clock" color="orange" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">موظفي الدائرة</h3>
              <div className="space-y-2">
                {data.employees?.map((emp: any) => (
                  <div key={emp.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-700 font-bold text-xs">{emp.full_name_ar.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{emp.full_name_ar}</p>
                      <p className="text-xs text-gray-500">{emp.job_title_ar}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <RecentDocuments documents={data.recent_documents || []} />
          </div>
        </>
      )}

      {/* Employee Dashboard */}
      {role === 'employee' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="الكتب المرسلة" value={data.sent_documents || 0} icon="send" color="blue" />
            <StatCard title="الكتب المستلمة" value={data.received_documents || 0} icon="inbox" color="green" />
            <StatCard title="قيد المتابعة" value={data.pending_documents || 0} icon="clock" color="orange" />
          </div>

          <RecentDocuments documents={data.recent_documents || []} />
        </>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const icons: Record<string, JSX.Element> = {
    users: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
    document: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    clock: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    office: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    inbox: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    ),
    send: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
    folder: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  };

  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', colors[color])}>
          {icons[icon]}
        </div>
      </div>
    </div>
  );
}

function RecentDocuments({ documents }: { documents: any[] }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">آخر المراسلات</h3>
        <Link href="/documents" className="text-sm text-green-600 hover:text-green-700">
          عرض الكل
        </Link>
      </div>
      <div className="space-y-2">
        {documents.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">لا توجد مراسلات حتى الآن</p>
        ) : (
          documents.map((doc: any) => (
            <Link
              key={doc.id}
              href={`/documents/${doc.id}`}
              className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {doc.sender?.full_name_ar} ← {doc.receiver?.full_name_ar}
                  </p>
                </div>
                <span className={cn('badge whitespace-nowrap', PRIORITY_COLORS[doc.priority as keyof typeof PRIORITY_COLORS])}>
                  {PRIORITY_LABELS[doc.priority as keyof typeof PRIORITY_LABELS]}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className={cn('badge text-xs', STATUS_COLORS[doc.status as keyof typeof STATUS_COLORS])}>
                  {STATUS_LABELS[doc.status as keyof typeof STATUS_LABELS]}
                </span>
                <span className="text-xs text-gray-400">{formatDate(doc.created_at, 'datetime')}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
