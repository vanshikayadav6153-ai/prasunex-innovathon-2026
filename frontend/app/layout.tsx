import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./campus.css";
import { AuthProvider } from "@/context/AuthContext";
import { LogoutButton } from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "CAMPUS-NEXUS · One Campus. One Intelligence. Better Decisions.",
  description:
    "Transforming academic performance, campus operations and student wellbeing through connected AI. Learn · Connect · Thrive.",
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-white text-[#0B2E22] min-h-screen antialiased selection:bg-[#34D399] selection:text-[#0B2E22]">
        <AuthProvider>
          <LogoutButton />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
