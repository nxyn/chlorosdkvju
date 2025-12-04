import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import CustomCursor from "@/components/ui/CustomCursor";
import NeonGradientBackground from "@/components/ui/NeonGradientBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chlorocode",
  description: "AI-powered Vibe Coder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased cursor-none text-white selection:bg-primary/30 selection:text-primary-foreground`}
      >
        <div className="bg-noise" />
        <NeonGradientBackground />
        <CustomCursor />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
