import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Sistem Tahfiz - Manajemen & Pemantauan Hafalan Al-Qur\'an',
  description: 'Sistem Manajemen & Pemantauan Hafalan Al-Qur\'an Santri untuk Pesantren dan Sekolah Islam',
  openGraph: {
    title: 'Sistem Tahfiz - Manajemen & Pemantauan Hafalan Al-Qur\'an',
    description: 'Sistem Manajemen & Pemantauan Hafalan Al-Qur\'an Santri untuk Pesantren dan Sekolah Islam',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sistem Tahfiz - Manajemen & Pemantauan Hafalan Al-Qur\'an',
    description: 'Sistem Manajemen & Pemantauan Hafalan Al-Qur\'an Santri untuk Pesantren dan Sekolah Islam',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
