import type { Metadata } from "next";
import { Inter, Playfair_Display, Great_Vibes } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "@/components/providers/next-auth-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair-display" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-great-vibes" });

export const metadata: Metadata = {
  title: "Elivra | Elegant Event Invites",
  description: "Elivra lets you design and share premium digital invitations with QR codes — perfect for weddings, galas, and exclusive events.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const bodyClassName = `${inter.variable} ${playfairDisplay.variable} ${greatVibes.variable} antialiased`;
  return (
    <html lang="en">
      <head />
      <body
        className={bodyClassName}
        suppressHydrationWarning={true}
      >
        <NextAuthProvider>
          {children}
          <Toaster />
        </NextAuthProvider>
      </body>
    </html>
  );
}
