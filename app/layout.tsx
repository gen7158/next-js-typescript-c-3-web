import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { MainLayout } from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "C PASS LAB | C言語3級 AI学習",
  description: "C言語プログラミング能力認定試験3級の合格を目指すAI学習サイト",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#090b10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className="dark">
      <body><MainLayout>{children}</MainLayout></body>
    </html>
  );
}
