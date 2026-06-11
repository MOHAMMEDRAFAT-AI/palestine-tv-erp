'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { PRIORITY_LABELS, PRIORITY_COLORS, STATUS_LABELS, STATUS_COLORS } from '@/types';

export default function ReportsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    status: '',
    priority: '',
    office_id: '',
  });
  const [offices, setOffices] = useState<any[]>([]);

  useEffect(() => {
    const fetchOffices = async () => {
      try {
        const res = await api.get('/offices');
        setOffices(res.data.data || []);
      } catch {}
    };
    fetchOffices();
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.getDocuments({ per_page: 100, ...filters });
      setDocuments(res.data.data);
    } catch {
      console.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchDocuments();
  };

  const exportReport = () => {
    const csv = [
      ['رقم الكتاب', 'العنوان', 'المرسل', 'المستلم', 'الأولوية', 'الحالة', 'التاريخ'].join(','),
      ...documents.map((d) =>
        [
          d.document_number,
          `"${d.title}"`,
          `"${d.sender?.full_name_ar}"`,
          `"${d.receiver?.full_name_ar}"`,
          PRIORITY_LABELS[d.priority],
          STATUS_LABELS[d.status],
          formatDate(d.created_at, 'short'),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير-الكتب-الرسمية-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">التقارير</h1>
          <p className="page-subtitle">تقارير وإحصائيات الكتب الرسمية</p>
        </div>
        <button onClick={exportReport} className="btn btn-primary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          تصدير CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">من تاريخ</label>
            <input type="date" className="input" value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">إلى تاريخ</label>
            <input type="date" className="input" value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">الحالة</label>
            <select className="select" value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}>
              <option value="">الكل</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">الأولوية</label>
            <select className="select" value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}>
              <option value="">الكل</option>
              {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={applyFilters} className="btn btn-primary w-full">تطبيق</button>
          </div>
        </div>
      </div>

      {/* Summary */}
      {!loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي الكتب', value: documents.length },
            { label: 'كتب معلقة', value: documents.filter((d) => ['sent', 'received', 'in_progress'].includes(d.status)).length },
            { label: 'كتب منجزة', value: documents.filter((d) => d.status === 'completed').length },
            { label: 'كتب عاجلة', value: documents.filter((d) => d.priority === 'urgent' || d.priority === 'very_urgent').length },
          ].map((s, i) => (
            <div key={i} className="card p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Documents Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>رقم الكتاب</th>
              <th>العنوان</th>
              <th>المرسل</th>
              <th>المستلم</th>
              <th>الأولوية</th>
              <th>الحالة</th>
              <th>التاريخ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(7)].map((_, j) => <td key={j}><div className="skeleton h-5 w-20" /></td>)}
                </tr>
              ))
            ) : documents.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">لا توجد بيانات</td></tr>
            ) : (
              documents.map((doc: any) => (
                <tr key={doc.id}>
                  <td className="font-mono text-sm">{doc.document_number}</td>
                  <td>
                    <Link href={`/documents/${doc.id}`} className="text-sm text-green-700 hover:text-green-800">
                      {doc.title}
                    </Link>
                  </td>
                  <td className="text-sm text-gray-600">{doc.sender?.full_name_ar}</td>
                  <td className="text-sm text-gray-600">{doc.receiver?.full_name_ar}</td>
                  <td><span className={cn('badge', PRIORITY_COLORS[doc.priority])}>{PRIORITY_LABELS[doc.priority]}</span></td>
                  <td><span className={cn('badge', STATUS_COLORS[doc.status])}>{STATUS_LABELS[doc.status]}</span></td>
                  <td className="text-sm text-gray-500">{formatDate(doc.created_at, 'short')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
