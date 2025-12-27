import type { Metadata } from "next";
import { Outfit, Fira_Code } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const outfit = Outfit({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Today I Learned",
  description: "A journal for your daily learning adventures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${firaCode.variable} antialiased`}
      >
        <div className="min-h-screen pb-20 md:pb-0">
          <Navigation />
          <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
