"use client";

import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { RhythmSystem } from "@/components/experience/RhythmSystem";
import { OverlayProvider } from "@/components/providers/OverlayContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <OverlayProvider>
      <CartProvider>
        {children}
        <CartDrawer />
        <RhythmSystem />
      </CartProvider>
    </OverlayProvider>
  );
}
