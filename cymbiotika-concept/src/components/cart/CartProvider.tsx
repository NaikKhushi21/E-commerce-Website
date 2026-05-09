"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/data/products";

export type CartItem = {
  id: string;
  product: Product;
  variantId: string;
  quantity: number;
  subscription: boolean;
};

type CartContextValue = {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, variantId?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleSubscription: (id: string) => void;
  subtotal: number;
  itemCount: number;
  shopifyCartUrl: string | null;
  activePromo: {
    code: string;
    title: string;
    description: string;
  } | null;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_STORAGE_KEY = "cymbiotika-cart-v2";

function isProduct(value: unknown): value is Product {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === "string" && typeof candidate.title === "string" && Array.isArray(candidate.variants);
}

function loadStoredItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is CartItem => {
        if (!entry || typeof entry !== "object") return false;
        const item = entry as Partial<CartItem>;
        return (
          typeof item.id === "string" &&
          isProduct(item.product) &&
          typeof item.variantId === "string" &&
          typeof item.quantity === "number" &&
          typeof item.subscription === "boolean"
        );
      })
      .map((entry) => ({
        ...entry,
        quantity: Math.max(1, Math.floor(entry.quantity)),
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadStoredItems());
  const hasMounted = useRef(false);
  const [isOpen, setIsOpen] = useState(false);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => {
        const variant = item.product.variants.find((entry) => entry.id === item.variantId);
        const base = variant?.price ?? item.product.price;
        const subscriptionDiscount = item.subscription ? 0.9 : 1;
        return sum + base * item.quantity * subscriptionDiscount;
      }, 0),
    [items],
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const activePromo = useMemo(() => {
    const stack10 = process.env.NEXT_PUBLIC_SHOPIFY_STACK10_CODE?.trim() || "STACK10";
    const stack15 = process.env.NEXT_PUBLIC_SHOPIFY_STACK15_CODE?.trim() || "STACK15";

    if (itemCount >= 5) {
      return {
        code: stack15,
        title: "Bundle offer unlocked",
        description: "15% off when you build a 5-item stack.",
      };
    }
    if (itemCount >= 3) {
      return {
        code: stack10,
        title: "Stack offer unlocked",
        description: "10% off for a 3-item monthly stack.",
      };
    }
    return null;
  }, [itemCount]);

  const shopifyCartUrl = useMemo(() => {
    const domain = process.env.NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN ?? process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? "cymbiotika.com";
    const lines = items
      .map((item) => {
        const numeric = item.variantId.match(/(\d+)/)?.[1];
        if (!numeric) return null;
        return `${numeric}:${item.quantity}`;
      })
      .filter((entry): entry is string => Boolean(entry));

    if (items.length === 0) return null;
    const query = new URLSearchParams();
    query.set("storefront", "true");
    if (activePromo?.code) {
      query.set("discount", activePromo.code);
    }

    if (lines.length === 0) {
      return `https://${domain}/cart?${query.toString()}`;
    }
    return `https://${domain}/cart/${lines.join(",")}?${query.toString()}`;
  }, [items, activePromo]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function openCart() {
    setIsOpen(true);
  }

  function closeCart() {
    setIsOpen(false);
  }

  function addItem(product: Product, variantId?: string) {
    const selectedVariant = variantId ?? product.variants[0]?.id ?? `${product.id}-default`;
    const id = `${product.id}-${selectedVariant}`;

    setItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [
        ...prev,
        {
          id,
          product,
          variantId: selectedVariant,
          quantity: 1,
          subscription: false,
        },
      ];
    });

    setIsOpen(true);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function updateQuantity(id: string, quantity: number) {
    setItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
        .filter((item) => item.quantity > 0),
    );
  }

  function toggleSubscription(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, subscription: !item.subscription } : item)),
    );
  }

  const value: CartContextValue = {
    items,
    isOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
    updateQuantity,
    toggleSubscription,
    subtotal,
    itemCount,
    shopifyCartUrl,
    activePromo,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return context;
}
