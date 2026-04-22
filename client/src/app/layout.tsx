import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthBootstrap from "@/src/components/layout/auth-bootstrap";
import SiteHeader from "@/src/components/layout/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexus",
  description: "Intelligent Document and Image Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased`}
    >
      <body className="min-h-full bg-background text-foreground flex flex-col">
        <AuthBootstrap />
        <SiteHeader />
        <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
