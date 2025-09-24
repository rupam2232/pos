import type { Metadata } from "next";
// import localFont from "next/font/local";
import { Geist, Geist_Mono } from "next/font/google";
import "@repo/ui/styles/globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${process.env.NEXT_PUBLIC_APP_NAME} - Modern POS for Restaurants`,
  description: "The best point of sale system for restaurants, cafes, and retail businesses.",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {modal}
          {children}
        </Providers>
      </body>
    </html>
  );
}
