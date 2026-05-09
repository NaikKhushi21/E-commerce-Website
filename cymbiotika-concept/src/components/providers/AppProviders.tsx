"use client";

import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { RhythmSystem } from "@/components/experience/RhythmSystem";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <RhythmSystem />
    </CartProvider>
  );
}
