import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import GoogleTranslateWrapper from "@/components/Shared/GoogleTranslateWrapper";
import DomPatchLoader from "@/components/Shared/DomPatchLoader";
import DynamicPageTitle from "@/components/Shared/DynamicPageTitle";
import AppProviders from "@/providers/AppProviders";
// import { ErrorBoundary } from '@/components/ErrorBoundary';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
   
      
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <DynamicPageTitle />
          <DomPatchLoader />
          <GoogleTranslateWrapper />
          <AppProviders>{children}</AppProviders>
          <Toaster />
     
      </body>
    </html>
  );
}
