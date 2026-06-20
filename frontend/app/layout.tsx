import type { Metadata } from "next";
import { Suspense } from "react";
import AuthSessionVerifier from "@/components/auth/AuthSessionVerifier";
import DevAuthSessionReset from "@/components/auth/DevAuthSessionReset";
import NavigationInterceptor from "@/components/navigation/NavigationInterceptor";
import ToastProvider from "@/components/ui/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineX",
  description: "Website đặt vé xem phim trực tuyến",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-black text-white antialiased">
        <DevAuthSessionReset />
        <AuthSessionVerifier />
        {children}
        <ToastProvider />
        <Suspense fallback={null}>
          <NavigationInterceptor />
        </Suspense>
      </body>
    </html>
  );
}
