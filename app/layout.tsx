import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// The same font families are installed from the lockfile and self-hosted.
// Builds and visitors no longer require a connection to Google Fonts.
const sourceSans = localFont({
  src: "../node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2",
  variable: "--font-source-sans",
  weight: "200 900",
  display: "swap",
});

const sourceSerif = localFont({
  src: "../node_modules/@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2",
  variable: "--font-source-serif",
  weight: "200 900",
  display: "swap",
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
