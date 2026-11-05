import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";

// Fonts are downloaded at build time and self-hosted by Next.js;
// no requests are made to Google from visitors' browsers.
const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

const siteTitle = "North Houston Cancer Assistance Foundation | NHCAF";
const siteDescription =
  "North Houston Cancer Assistance Foundation (NHCAF) is an IRS-recognized 501(c)(3) public charity in Spring, Texas, providing charitable financial assistance and support to eligible individuals and families affected by cancer in the North Houston community.";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.nhcafoundation.org"),
  title: siteTitle,
  description: siteDescription,
  applicationName: "NHCAF",
  keywords: [
    "North Houston Cancer Assistance Foundation",
    "NHCAF",
    "cancer financial assistance",
    "cancer charity",
    "501(c)(3)",
    "Spring Texas",
    "North Houston",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://www.nhcafoundation.org",
    siteName: "North Houston Cancer Assistance Foundation",
    title: siteTitle,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
