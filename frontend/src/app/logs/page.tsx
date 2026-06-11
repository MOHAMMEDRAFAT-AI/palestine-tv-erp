'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const [logsRes, statsRes] = await Promise.all([
          api.getLogs({ per_page: 50 }),
          api.getLogStats(),
        ]);
        setLogs(logsRes.data.data);
        setStats(statsRes.data.data);
      } catch {
        console.error('Failed to load logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">سجل العمليات</h1>
          <p className="page-subtitle">تسجيل وتتبع جميع العمليات في النظام</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'إجمالي العمليات', value: stats.total_logs },
          { label: 'عمليات اليوم', value: stats.today_logs },
          { label: 'تسجيل دخول', value: stats.login_count },
          { label: 'عمليات الكتب', value: stats.document_actions },
          { label: 'عمليات المستخدمين', value: stats.user_actions },
        ].map((stat, i) => (
          <div key={i} className="card p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stat.value || 0}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Logs Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>المستخدم</th>
              <th>الإجراء</th>
              <th>الوصف</th>
              <th>عنوان IP</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(10)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j}><div className="skeleton h-5 w-24" /></td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400">لا توجد سجلات</td></tr>
            ) : (
              logs.map((log: any) => (
                <tr key={log.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">{log.user?.full_name_ar?.charAt(0)}</span>
                      </div>
                      <span className="text-sm text-gray-900">{log.user?.full_name_ar || 'نظام'}</span>
                    </div>
                  </td>
                  <td><span className="badge bg-gray-100 text-gray-700">{log.action}</span></td>
                  <td className="text-sm text-gray-600">{log.description_ar}</td>
                  <td className="text-sm font-mono text-gray-500">{log.ip_address || '-'}</td>
                  <td className="text-sm text-gray-500">{formatDate(log.created_at, 'datetime')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
