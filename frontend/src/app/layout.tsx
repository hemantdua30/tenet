'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './contexts/auth-context';
import styles from './styles/layout.module.css';

const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'ANGULARIS - AI-Powered Machine Inspection Software',
//   description: 'Transform industrial maintenance with AI-powered machine inspection software. Detect anomalies, predict failures, and optimize maintenance schedules.',
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>TENET - AI-Powered Inspections</title>
        <meta name="description" content="Transform industrial maintenance with AI-powered machine inspection software. Detect anomalies, predict failures, and optimize maintenance schedules." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.className} ${styles.root}`}>
        <div className={styles.pageWrapper}>
          <AuthProvider>
            <main className={styles.mainContent} suppressHydrationWarning>
              {children}
            </main>
          </AuthProvider>
        </div>
      </body>
    </html>
  );
}
