'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { cn, formatDate, truncate } from '@/lib/utils';
import Link from 'next/link';
import { PRIORITY_LABELS, PRIORITY_COLORS, STATUS_LABELS, STATUS_COLORS } from '@/types';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const params: any = { per_page: 20 };
        if (filter !== 'all') params.status = filter;
        if (search) params.title = search;
        const res = await api.getDocuments(params);
        setDocuments(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [filter, search]);

  const filters = [
    { value: 'all', label: 'الكل' },
    { value: 'draft', label: 'مسودة' },
    { value: 'sent', label: 'مرسل' },
    { value: 'received', label: 'مستلم' },
    { value: 'in_progress', label: 'قيد المتابعة' },
    { value: 'completed', label: 'منجز' },
    { value: 'rejected', label: 'مرفوض' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">الكتب الرسمية</h1>
          <p className="page-subtitle">إدارة ومتابعة جميع الكتب الرسمية</p>
        </div>
        <Link href="/documents/new" className="btn btn-primary">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          كتاب جديد
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pr-10"
            placeholder="بحث في الكتب الرسمية..."
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
              filter === f.value
                ? 'bg-green-700 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <div className="spinner mx-auto" />
                </td>
              </tr>
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-400">
                  لا توجد كتب رسمية
                </td>
              </tr>
            ) : (
              documents.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="font-mono text-sm font-medium text-gray-900">{doc.document_number}</td>
                  <td>
                    <Link href={`/documents/${doc.id}`} className="text-sm font-medium text-gray-900 hover:text-green-700">
                      {truncate(doc.title, 50)}
                    </Link>
                  </td>
                  <td className="text-sm text-gray-600">{doc.sender?.full_name_ar}</td>
                  <td className="text-sm text-gray-600">{doc.receiver?.full_name_ar}</td>
                  <td>
                    <span className={cn('badge', PRIORITY_COLORS[doc.priority as keyof typeof PRIORITY_COLORS])}>
                      {PRIORITY_LABELS[doc.priority as keyof typeof PRIORITY_LABELS]}
                    </span>
                  </td>
                  <td>
                    <span className={cn('badge', STATUS_COLORS[doc.status as keyof typeof STATUS_COLORS])}>
                      {STATUS_LABELS[doc.status as keyof typeof STATUS_LABELS]}
                    </span>
                  </td>
                  <td className="text-sm text-gray-500">{formatDate(doc.created_at, 'short')}</td>
                  <td>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      عرض
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
