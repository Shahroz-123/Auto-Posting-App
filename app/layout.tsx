import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarketHub | Digital Marketing Portal",
  description:
    "Centralized digital marketing management for multiple companies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}