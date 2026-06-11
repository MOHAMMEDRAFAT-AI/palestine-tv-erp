'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { cn, formatDate, truncate } from '@/lib/utils';
import Link from 'next/link';
import { PRIORITY_LABELS, PRIORITY_COLORS, STATUS_LABELS, STATUS_COLORS } from '@/types';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await api.search(query, type);
      setResults(res.data.data);
    } catch {
      setResults({});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">البحث</h1>
          <p className="page-subtitle">بحث في الكتب الرسمية والمستخدمين والمرفقات</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="card p-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input pr-10"
              placeholder="ابحث باسم الموظف، رقم وظيفي، رقم كتاب، عنوان..."
            />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value)} className="select w-36">
            <option value="all">الكل</option>
            <option value="documents">كتب رسمية</option>
            <option value="users">مستخدمين</option>
          </select>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'جاري البحث...' : 'بحث'}
          </button>
        </div>
      </form>

      {searched && !loading && (
        <div className="space-y-6">
          {/* Document Results */}
          {results.documents?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                الكتب الرسمية ({results.documents.length})
              </h3>
              <div className="space-y-2">
                {results.documents.map((doc: any) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {doc.document_number} - {doc.sender?.full_name_ar} ← {doc.receiver?.full_name_ar}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={cn('badge', PRIORITY_COLORS[doc.priority])}>
                          {PRIORITY_LABELS[doc.priority]}
                        </span>
                        <span className={cn('badge', STATUS_COLORS[doc.status])}>
                          {STATUS_LABELS[doc.status]}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* User Results */}
          {results.users?.length > 0 && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                المستخدمون ({results.users.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.users.map((u: any) => (
                  <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-700 font-bold text-sm">{u.full_name_ar?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.full_name_ar}</p>
                      <p className="text-xs text-gray-500">{u.employee_number} - {u.job_title_ar}</p>
                      <p className="text-xs text-gray-400">{u.office?.name_ar} - {u.department?.name_ar}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!results.documents?.length && !results.users?.length && (
            <div className="card p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-400">لم يتم العثور على نتائج لـ "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
