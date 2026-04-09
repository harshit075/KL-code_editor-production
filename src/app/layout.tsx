import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kadel Labs Code Editor",
  description: "Online coding assessment platform for DSA problems",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`font-sans bg-slate-50 text-slate-900 min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
