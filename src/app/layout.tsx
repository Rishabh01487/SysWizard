import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "SysWizard — Master System Design Visually",
  description:
    "Master 85+ system design & full-stack algorithm concepts with stunning interactive animations, in-depth readable notes, and AI-powered tutoring.",
  keywords: [
    "SysWizard", "System Design", "Interview Prep", "Algorithms",
    "Data Structures", "Distributed Systems", "Next.js",
  ],
  authors: [{ name: "SysWizard" }],
  icons: { icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg" },
  openGraph: {
    title: "SysWizard — Master System Design Visually",
    description: "Animated · Interactive · AI-Powered system design learning.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${jetbrains.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
