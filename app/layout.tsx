import type { Metadata } from "next";
import { IBM_Plex_Sans, Rajdhani } from "next/font/google";
import "./globals.css";

const display = Rajdhani({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const body = IBM_Plex_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Rent vs. Buy Calculator",
  description: "Compare renting against buying over a long-term horizon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
