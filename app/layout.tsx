import './globals.css';
import type { Metadata } from 'next';
import NotificationListener from './NotificationListener';

export const metadata: Metadata = {
  title: 'Campus Career Copilot',
  description: 'AI-powered campus placement assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NotificationListener />
        {children}
      </body>
    </html>
  );
}