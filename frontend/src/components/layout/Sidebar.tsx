'use client';

import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  label: string;
  icon: string;
  href: string;
  roles: string[];
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: 'لوحة التحكم',
    icon: 'dashboard',
    href: '/dashboard',
    roles: ['supervisor', 'general_manager', 'department_manager', 'employee'],
  },
  {
    label: 'الكتب الرسمية',
    icon: 'document',
    href: '/documents',
    roles: ['supervisor', 'general_manager', 'department_manager', 'employee'],
    children: [
      { label: 'جميع الكتب', href: '/documents' },
      { label: 'كتاب جديد', href: '/documents/new' },
    ],
  },
  {
    label: 'المستخدمون',
    icon: 'users',
    href: '/users',
    roles: ['supervisor', 'general_manager', 'department_manager'],
  },
  {
    label: 'الدردشة',
    icon: 'chat',
    href: '/chat',
    roles: ['supervisor', 'general_manager', 'department_manager', 'employee'],
  },
  {
    label: 'التقارير',
    icon: 'report',
    href: '/reports',
    roles: ['supervisor', 'general_manager'],
  },
  {
    label: 'البحث',
    icon: 'search',
    href: '/search',
    roles: ['supervisor', 'general_manager', 'department_manager', 'employee'],
  },
  {
    label: 'سجل العمليات',
    icon: 'log',
    href: '/logs',
    roles: ['supervisor'],
  },
];

const iconMap: Record<string, JSX.Element> = {
  dashboard: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  chat: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  report: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  log: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  if (!user) return null;

  const role = user.role?.name || '';

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className={cn(
        'fixed right-0 top-0 bottom-0 bg-white border-l border-gray-200 z-40 transition-all duration-300 flex flex-col',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">PTV</span>
        </div>
        {!collapsed && (
          <div>
            <h2 className="font-bold text-gray-900 text-sm">تلفزيون فلسطين</h2>
            <p className="text-xs text-gray-500">نظام الإدارة المتكامل</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mr-auto p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className={cn('w-5 h-5 text-gray-500 transition-transform', collapsed && 'rotate-180')} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredItems.map((item) => (
          <div key={item.label}>
            <Link
              href={item.href}
              onClick={() => item.children && toggleExpand(item.label)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors',
                isActive(item.href)
                  ? 'bg-green-50 text-green-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="flex-shrink-0">{iconMap[item.icon]}</span>
              {!collapsed && (
                <>
                  <span className="text-sm">{item.label}</span>
                  {item.children && (
                    <svg
                      className={cn(
                        'w-4 h-4 mr-auto transition-transform',
                        expandedItems.includes(item.label) && 'rotate-180'
                      )}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </>
              )}
            </Link>
            {!collapsed && item.children && expandedItems.includes(item.label) && (
              <div className="mr-8 mt-1 space-y-1">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      'block px-3 py-2 rounded-lg text-sm transition-colors',
                      pathname === child.href
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    )}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Info */}
      <div className="border-t border-gray-200 p-4">
        <Link href="/profile" className="flex items-center gap-3 hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-green-700 font-bold text-sm">
              {user.full_name_ar.charAt(0)}
            </span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.full_name_ar}</p>
              <p className="text-xs text-gray-500 truncate">{user.job_title_ar}</p>
            </div>
          )}
        </Link>
      </div>
    </aside>
  );
}
