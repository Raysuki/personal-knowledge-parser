import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ProfileFlow",
  description: "上传个人资料并自动解析为结构化信息，支持校对、保存入库与模板回填。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <div className="site-video-bg" aria-hidden="true">
          <video className="site-video-bg__media" autoPlay muted loop playsInline preload="auto">
            <source src="/background.mp4" type="video/mp4" />
          </video>
          <div className="site-video-bg__overlay" />
        </div>
        <div className="site-shell">{children}</div>
      </body>
    </html>
  );
}
