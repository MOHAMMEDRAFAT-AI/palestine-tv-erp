import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'تلفزيون فلسطين - نظام الإدارة المتكامل',
  description: 'نظام إدارة مؤسسية متكامل لتلفزيون فلسطين',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
