import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "简流ProfileFlow",
  description: "上传个人资料并自动解析为结构化信息，支持校对、保存入库与模板回填。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
