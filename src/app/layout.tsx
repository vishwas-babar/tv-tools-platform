import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { CartProvider } from "@/contexts/cart-context";

export const metadata: Metadata = {
  title: "TV Tools Platform",
  description: "TradingView Tools Subscription Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <CartProvider>
          <Navbar />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
