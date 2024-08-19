import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/lib/providers";
const geistSans = localFont({
  src: "../public/fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "../public/fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Collabify - Whiteboard Collab",
  description: "Collabify offers a dynamic platform for real-time collaboration on digital whiteboards. Work together, brainstorm, and create seamlessly online.",
  keywords: [
    "digital whiteboard",
    "real-time collaboration",
    "online whiteboard",
    "interactive workspace",
    "team collaboration",
    "brainstorming tools",
    "virtual whiteboard"
  ],
  metadataBase: new URL('https://collabify-whiteboard.vercel.app'),
  robots: "index, follow, cache",
  alternates: {
    canonical: 'https://collabify-whiteboard.vercel.app'
  }
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
      <Providers>{children}</Providers>
      <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Whiteboard Collab",
              url: "https://collabify-whiteboard.vercel.app",
              description: "Collabify Whiteboard Collab provides a dynamic platform for real-time digital collaboration. Engage with your team, brainstorm, and create together on an interactive whiteboard.",
            }),
          }}
        />
      </body>
    </html>
  );
}
