import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { MotionProvider } from "@/components/motion";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Sparks } from "@/components/forge/Sparks";
import { SmoothScroll } from "@/components/site/SmoothScroll";
import { PageTransition } from "@/components/site/PageTransition";
import { getProfile } from "@/lib/content";

const generalSans = localFont({
  src: "../fonts/GeneralSans-Variable.woff2",
  weight: "200 700",
  display: "swap",
  variable: "--font-general-sans",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
});

export function generateMetadata(): Metadata {
  const site = getProfile();
  let metadataBase: URL | undefined;
  try {
    metadataBase = site.url ? new URL(site.url) : undefined;
  } catch {
    metadataBase = undefined;
  }
  return {
    metadataBase,
    title: {
      default: `${site.name} — ${site.role}`,
      template: `%s — ${site.name}`,
    },
    description: site.tagline,
    icons: { icon: "/logo.png" },
    openGraph: {
      title: `${site.name} — ${site.role}`,
      description: site.tagline,
      url: site.url || undefined,
      siteName: site.name,
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = getProfile();
  return (
    <html
      lang="en"
      className={`${generalSans.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="relative flex min-h-full flex-col bg-ink-950">
        {/* Entrance animations render their "before" state inline, so without
            JavaScript the page would arrive blank. This reveals everything. */}
        <noscript>
          <style>{`[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important;clip-path:none!important}`}</style>
        </noscript>
        <div className="grain" aria-hidden />
        <a
          href="#main"
          className="index-label tap sr-only z-[100] rounded-sm bg-ember-500 px-4 font-medium text-ink-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <MotionProvider>
          <Header name={site.name} />
          <main id="main" className="relative flex-1">
            {children}
          </main>
          <Footer site={site} />
          <Sparks />
          <SmoothScroll />
          <PageTransition />
        </MotionProvider>
      </body>
    </html>
  );
}
