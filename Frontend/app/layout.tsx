import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import SystemRulesModal from "@/components/system-rules-modal";

export const metadata: Metadata = {
  title: "XP System Auth",
  description: "Minimal authentication frontend for the XP System API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SystemRulesModal />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
