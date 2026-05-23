import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Truffl",
  description: "AI voice recovery journeys for D2C brands"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
