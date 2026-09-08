import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OmniArena - Multiple AIs. One Arena.",
    template: "%s | OmniArena",
  },
  description:
    "Ask once. Compare responses from GPT, Claude, Gemini, and Grok side-by-side in the Arena.",
  keywords: ["AI", "comparison", "GPT", "Claude", "Gemini", "Grok", "multi-model"],
  openGraph: {
    title: "OmniArena - Multiple AIs. One Arena.",
    description: "Compare AI responses side-by-side in a premium workspace.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={[inter.variable, jetbrains.variable].join(" ")}>
      <body className="bg-[#0A0A0F] text-[#F0F0F5] antialiased">
        {children}
      </body>
    </html>
  );
}
