import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Burnly — Financial Model & Runway Sandbox',
  description: 'Precision startup financial modeling, burn projection, and risk analysis sandbox.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0E1420] text-[#E8EAF0] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
