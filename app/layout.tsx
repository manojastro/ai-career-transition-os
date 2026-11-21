import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/shell/AppShell";
import { Toaster } from "@/components/shared/Toaster";

export const metadata: Metadata = {
  title: "AI Career & Transition OS",
  description: "Personal career operating system for transitioning into AI engineering",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <AppShell>{children}</AppShell>
        <Toaster />
      </body>
    </html>
  );
}
