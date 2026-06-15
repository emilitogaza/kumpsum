import type { Metadata } from "next";
import { Mona_Sans } from "next/font/google";
import "./globals.css";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const SITE_NAME = "Kumpsum";
const SITE_DESCRIPTION =
  "En lorem ipsum-generator med svenska bokstäver (åäö) och gott om öl. Välj ord, meningar eller stycken.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: "Kumpsum — svensk lorem ipsum med öl",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: {
      template: `%s | ${SITE_NAME}`,
      default: "Kumpsum — svensk lorem ipsum med öl",
    },
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    locale: "sv_SE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: {
      template: `%s | ${SITE_NAME}`,
      default: "Kumpsum — svensk lorem ipsum med öl",
    },
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sv"
      className={`${monaSans.variable} h-full antialiased selection:text-ink selection:bg-brand`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
