import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cymbiotika Concept",
  description: "Premium animated headless commerce prototype.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[var(--bg)] text-[var(--text)]">
        <AppProviders>
          <SmoothScroll />
          <Header />
          <main className="relative z-10 min-h-screen w-full">
            <div className="mx-auto w-full max-w-[1680px] px-5 py-12 md:px-12 md:py-16">{children}</div>
          </main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
