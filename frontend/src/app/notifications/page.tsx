'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.getNotifications({ per_page: 50 });
        setNotifications(res.data.data.notifications || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })));
    } catch {}
  };

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch {}
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">الإشعارات</h1>
          <p className="page-subtitle">جميع الإشعارات والتنبيهات</p>
        </div>
        <button onClick={handleMarkAllRead} className="btn btn-outline">
          تحديد الكل مقروء
        </button>
      </div>

      <div className="space-y-2">
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="card p-4">
              <div className="skeleton h-5 w-48 mb-2" />
              <div className="skeleton h-4 w-64" />
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">لا توجد إشعارات</div>
        ) : (
          notifications.map((n: any) => (
            <div
              key={n.id}
              className={`card p-4 transition-colors ${!n.read_at ? 'border-r-4 border-green-600 bg-green-50/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{n.title_ar}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{n.body_ar}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(n.created_at, 'datetime')}</p>
                </div>
                {!n.read_at && (
                  <button onClick={() => { handleMarkRead(n.id); }} className="text-xs text-green-600 hover:text-green-700 whitespace-nowrap">
                    تحديد مقروء
                  </button>
                )}
              </div>
              {n.reference_type === 'document' && n.reference_id && (
                <Link href={`/documents/${n.reference_id}`} className="text-xs text-green-700 hover:text-green-800 mt-2 inline-block">
                  عرض الكتاب →
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
