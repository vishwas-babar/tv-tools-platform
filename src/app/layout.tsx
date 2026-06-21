import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { CartProvider } from "@/contexts/cart-context";
import { SITE_DESCRIPTION, SITE_LOGO, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: SITE_LOGO,
    apple: SITE_LOGO,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <CartProvider>
          <Navbar />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
