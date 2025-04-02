import Navbar from '@/components/ui/Navbar';
import Providers from '@/components/Providers';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Virtual Study Room",
  description: "나만의 3D 스터디룸에서 공부하고 목표를 공유하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased min-h-screen`}
      >
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
