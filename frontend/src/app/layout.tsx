import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CampusOS - Higher Education Operating System',
  description: 'Connected digital campus platform for students and faculty',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
