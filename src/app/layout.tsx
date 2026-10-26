import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const adornSerif = Playfair_Display({
  variable: "--font-adorn",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Eduspheere — Study, Analyze & Clear Doubts | Cooper AI Academic Platform",
  description: "Web platform for students to study, analyze, and clear doubts with role-based access (Staff & Student). Featuring daily attendance, class notes, doubt clearing, and Cooper AI powered by MCP tools.",
  keywords: ["eduspheere", "cooper ai", "mcp server", "doubt clearing", "class notes", "student attendance", "white yellow theme", "adorn font"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${adornSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body bg-[#fefdf9] text-slate-900 selection:bg-yellow-300 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
