"use client";

import { CartButton } from "@/components/cart-button";

/**
 * Thin client wrapper around CartButton so it can be rendered
 * inside the server-component Navbar.
 */
export function NavbarCartButton() {
  return <CartButton />;
}
