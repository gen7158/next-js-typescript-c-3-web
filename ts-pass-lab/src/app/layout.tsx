import type { Metadata, Viewport } from "next";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "TS PASS LAB | TypeScript・Webフルスタック学習",
  description: "TypeScriptからReact、Next.js、API、DB、認証、テスト、デプロイまで学ぶAI学習サイト",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#7c6cf2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body><PwaRegister />{children}</body>
    </html>
  );
}
