'use client';

import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await api.getUnreadNotificationCount();
        setUnreadNotifications(res.data.data.count);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications({ per_page: 5 });
      setNotifications(res.data.data.notifications || []);
    } catch {}
  };

  const toggleNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      await loadNotifications();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-900">
            مرحباً، {user?.full_name_ar}
          </h1>
          {user?.role && (
            <span className="badge bg-green-100 text-green-700 border border-green-200">
              {user.role.label_ar}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search quick access */}
          <Link
            href="/search"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 relative"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in">
                <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">الإشعارات</h3>
                  {unreadNotifications > 0 && (
                    <button
                      onClick={async () => {
                        await api.markAllNotificationsRead();
                        setUnreadNotifications(0);
                        setNotifications([]);
                      }}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      تحديد الكل كمقروء
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">
                      لا توجد إشعارات جديدة
                    </div>
                  ) : (
                    notifications.map((n: any) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          api.markNotificationRead(n.id);
                          if (n.reference_type === 'document' && n.reference_id) {
                            router.push(`/documents/${n.reference_id}`);
                          }
                        }}
                        className={cn(
                          'w-full text-right p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0',
                          !n.read_at && 'bg-green-50/50'
                        )}
                      >
                        <p className="text-sm font-medium text-gray-900">{n.title_ar}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{n.body_ar}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.created_at).toLocaleDateString('ar-SA')}
                        </p>
                      </button>
                    ))
                  )}
                </div>
                <Link
                  href="/notifications"
                  className="block p-3 text-center text-sm text-green-600 hover:bg-green-50 border-t border-gray-100"
                >
                  عرض جميع الإشعارات
                </Link>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-700 font-bold text-xs">
                  {user?.full_name_ar?.charAt(0)}
                </span>
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-fade-in">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user?.full_name_ar}</p>
                  <p className="text-xs text-gray-500">{user?.employee_number}</p>
                </div>
                <div className="p-1">
                  <Link
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    الملف الشخصي
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    الإعدادات
                  </Link>
                </div>
                <div className="border-t border-gray-100 p-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    تسجيل الخروج
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
