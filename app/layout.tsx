import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeTransitionProvider } from "@/components/theme-transition";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ollama Chat",
  description: "Local AI chat powered by Ollama",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ThemeTransitionProvider>
            <Suspense fallback={null}>{children}</Suspense>
          </ThemeTransitionProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
