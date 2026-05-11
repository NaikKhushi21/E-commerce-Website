"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const navItems = [
  { label: "Shop", href: "/" },
  { label: "Science", href: "/science" },
];

export function AnimatedNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 rounded-full border border-[--brand-mint]/35 bg-white p-1">
      {navItems.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm text-[#294031] transition hover:text-[#1f2f24]",
              active && "text-white",
            )}
          >
            {active ? (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 -z-10 rounded-full bg-[--brand-mint]"
                transition={{ type: "spring", stiffness: 340, damping: 28 }}
              />
            ) : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
