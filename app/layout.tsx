import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { UserRoleProvider } from "@/components/UserRoleContext";
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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased" suppressHydrationWarning>
        <UserRoleProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Header />
              <div className="flex-1">{children}</div>
            </div>
          </div>
        </UserRoleProvider>
      </body>
    </html>
  );
}
