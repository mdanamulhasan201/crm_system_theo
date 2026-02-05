import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from "react-hot-toast";
import Script from "next/script";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CustomShaftDataProvider } from "@/contexts/CustomShaftDataContext";
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
        <ErrorBoundary>
          <div id="google_translate_element" style={{ display: "hidden" }}></div>
          <Script id="google-translate-init" strategy="afterInteractive">
            {`
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'de',
                  includedLanguages: 'en,de',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            `}
          </Script>

          <Script
            src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
            strategy="afterInteractive"
          />
          <LanguageProvider>
            <AuthProvider>
              <CustomShaftDataProvider>
                {children}
              </CustomShaftDataProvider>
            </AuthProvider>
          </LanguageProvider>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
