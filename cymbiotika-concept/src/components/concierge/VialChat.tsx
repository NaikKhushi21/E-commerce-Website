"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SafeImage } from "@/components/ui/SafeImage";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/data/products";

type Recommendation = {
  reason: string;
  product: Product;
};

type Message =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; recommendations?: Recommendation[] };

const STARTERS = [
  "Where do I start?",
  "What helps morning energy?",
  "Why liposomal?",
];

const ATTENTION_DISMISSED_KEY = "cymborg-attention-dismissed";

export function VialChat() {
  const [open, setOpen] = useState(false);
  const [attentionOpen, setAttentionOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addItem, openCart } = useCart();

  // Surface the attention pop-up shortly after the page settles, but only
  // once per browser — once dismissed, it stays out of the way.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(ATTENTION_DISMISSED_KEY) === "1";
    } catch {
      // Storage blocked — fall through and show.
    }
    if (dismissed) return;
    const id = window.setTimeout(() => setAttentionOpen(true), 1800);
    return () => window.clearTimeout(id);
  }, []);

  function dismissAttention() {
    setAttentionOpen(false);
    try {
      window.localStorage.setItem(ATTENTION_DISMISSED_KEY, "1");
    } catch {
      // ignore — dismissing in-memory is enough for this session
    }
  }

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, thinking]);

  useEffect(() => {
    if (!open) return;
    setMessages([]);
    setInput("");
    setThinking(false);
    const id = window.setTimeout(() => inputRef.current?.focus(), 360);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const send = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed || thinking) return;
    setInput("");
    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setThinking(true);

    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (typeof data?.message === "string" && data.message.length > 0) {
        const recs = Array.isArray(data.recommendations)
          ? (data.recommendations as Recommendation[])
          : [];
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message, recommendations: recs },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "The vial is settling. Try once more in a moment." },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Connection lost in the column. Try once more." },
      ]);
    } finally {
      setThinking(false);
    }
  };

  function openChat() {
    dismissAttention();
    setOpen(true);
  }

  return (
    <>
      <AnimatePresence>
        {!open && attentionOpen && (
          <motion.div
            key="cymborg-attention"
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Cymborg introduction"
            className="fixed bottom-[88px] right-6 z-[60] w-44 rounded-xl border border-[var(--forest)] bg-[var(--surface-elevated)] py-2.5 pl-3 pr-5 shadow-[0_14px_30px_rgba(12,31,28,0.20)]"
          >
            <button
              type="button"
              onClick={dismissAttention}
              aria-label="Dismiss"
              className="absolute right-1 top-1 rounded-full p-0.5 text-[var(--muted)] transition-colors hover:bg-[rgba(12,31,28,0.06)] hover:text-[var(--forest)]"
            >
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                <path
                  d="M1.5 1.5 L10.5 10.5 M10.5 1.5 L1.5 10.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <p className="font-display text-[13px] leading-snug text-[var(--forest)]">Hi, I&apos;m Cymborg.</p>
            <p className="mt-0.5 text-[11px] leading-snug text-[var(--muted)]">Routine question?</p>
            {/* Tail pointing toward the launcher below. */}
            <span
              aria-hidden
              className="absolute -bottom-1.5 right-12 h-2.5 w-2.5 rotate-45 border-b border-r border-[var(--forest)] bg-[var(--surface-elevated)]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!open && (
          <motion.button
            key="vial-fab"
            initial={{ opacity: 0, y: 24, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.85 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={openChat}
            className="group fixed bottom-6 right-6 z-[60] cursor-pointer"
            aria-label="Open Cymbiotika routine concierge"
          >
            <span className="relative block h-28 w-28 drop-shadow-[0_14px_32px_rgba(12,31,28,0.32)] transition-transform duration-500 [transition-timing-function:var(--easing-premium)] group-hover:scale-[1.05]">
              <Image
                src="/brand/cymborg-avatar.png"
                alt="Cymborg"
                fill
                sizes="112px"
                className="object-contain"
                priority
              />
            </span>
            <span className="absolute -left-2 top-1/2 -translate-x-full -translate-y-1/2 whitespace-nowrap rounded-full bg-[var(--surface-elevated)] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-[var(--forest)] opacity-0 shadow-[0_8px_22px_rgba(12,31,28,0.14)] transition-opacity duration-500 group-hover:opacity-100">
              Ask Cymborg
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="vial-panel"
            initial={{ opacity: 0, scale: 0.55, y: 60, x: 60, borderRadius: "50%" }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0, borderRadius: "32px" }}
            exit={{ opacity: 0, scale: 0.6, y: 40, x: 40 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-[60] flex w-[min(380px,calc(100vw-2rem))] flex-col"
            style={{
              height: "min(580px, calc(100svh - 2rem))",
              background:
                "linear-gradient(180deg, rgba(245,239,228,0.96) 0%, rgba(245,225,184,0.7) 50%, rgba(229,183,115,0.32) 100%)",
              borderRadius: "32px 32px 96px 96px / 32px 32px 22% 22%",
              border: "1px solid rgba(229,183,115,0.45)",
              boxShadow:
                "0 36px 90px rgba(12,31,28,0.22), inset 0 0 80px rgba(229,183,115,0.18), inset 0 2px 1px rgba(255,255,255,0.7)",
              backdropFilter: "blur(28px)",
            }}
          >
            <div className="absolute -top-3 left-1/2 h-3 w-20 -translate-x-1/2 rounded-t-md bg-[var(--forest)]" aria-hidden />

            <header className="relative flex items-center justify-between border-b border-[rgba(12,31,28,0.08)] px-5 py-4">
              <div>
                <p className="text-[9px] uppercase tracking-[0.32em] text-[var(--muted)]">Cymbiotika</p>
                <p className="font-display text-base text-[var(--forest)]">Cymborg</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-[var(--muted)] transition-colors hover:bg-[rgba(12,31,28,0.06)] hover:text-[var(--forest)]"
                aria-label="Close concierge"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1.5 1.5L12.5 12.5M12.5 1.5L1.5 12.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </header>

            <div ref={scrollRef} className="no-scrollbar relative flex-1 overflow-y-auto px-4 py-5">
              <FloatingDust />

              {messages.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="relative space-y-4"
                >
                  <p className="text-center font-display text-base leading-snug text-[var(--forest)]">
                    A small concierge for ingredient questions, routine timing, and absorption science.
                  </p>
                  <div className="space-y-2">
                    {STARTERS.map((p) => (
                      <button
                        key={p}
                        onClick={() => send(p)}
                        className="w-full rounded-full border border-[rgba(229,183,115,0.45)] bg-[rgba(255,255,255,0.6)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--forest)] transition hover:border-[var(--accent)] hover:bg-white"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div layout className="relative space-y-3">
                <AnimatePresence initial={false}>
                  {messages.map((m, i) => (
                    <Vesicle
                      key={i}
                      message={m}
                      onAdd={(rec) => {
                        addItem(rec.product);
                        openCart();
                      }}
                    />
                  ))}
                  {thinking && <ThinkingVesicle key="thinking" />}
                </AnimatePresence>
              </motion.div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="relative flex items-center gap-2 border-t border-[rgba(12,31,28,0.08)] px-3 py-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a routine…"
                disabled={thinking}
                className="flex-1 rounded-full border border-[rgba(12,31,28,0.12)] bg-white/80 px-4 py-2 text-sm text-[var(--forest)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:bg-white disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--forest)] text-white transition hover:scale-[1.06] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Vesicle({
  message,
  onAdd,
}: {
  message: Message;
  onAdd: (rec: Recommendation) => void;
}) {
  const isUser = message.role === "user";
  const recs = !isUser ? message.recommendations ?? [] : [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.55, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7, y: -8 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`relative flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div className={`flex max-w-[88%] flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`relative px-4 py-3 ${isUser ? "" : "font-display"}`}
          style={{
            borderRadius: "26px",
            background: isUser
              ? "radial-gradient(circle at 28% 22%, #20473a 0%, #0c1f1c 70%)"
              : "radial-gradient(circle at 28% 22%, #fffaf0 0%, #f5d7a8 60%, #e5b773 100%)",
            color: isUser ? "rgba(253,246,232,0.95)" : "#0c1f1c",
            border: isUser
              ? "1px solid rgba(229,183,115,0.32)"
              : "1px solid rgba(229,183,115,0.62)",
            boxShadow: isUser
              ? "0 10px 26px rgba(12,31,28,0.22), inset 0 0 18px rgba(229,183,115,0.12)"
              : "0 10px 26px rgba(229,183,115,0.22), inset 0 0 22px rgba(255,255,255,0.55)",
            fontSize: isUser ? "13px" : "14px",
            lineHeight: 1.5,
          }}
        >
          {message.content}
        </div>

        {recs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-full flex-col gap-2"
          >
            {recs.map((rec) => (
              <ProductChip key={rec.product.id} rec={rec} onAdd={onAdd} />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function ProductChip({ rec, onAdd }: { rec: Recommendation; onAdd: (rec: Recommendation) => void }) {
  const { product, reason } = rec;

  return (
    <div
      className="group flex items-center gap-3 rounded-[18px] border border-[rgba(229,183,115,0.55)] bg-[rgba(255,255,255,0.7)] p-2 pr-3 backdrop-blur-md transition-all hover:bg-white"
      style={{ boxShadow: "0 8px 22px rgba(229,183,115,0.18)" }}
    >
      <Link
        href={`/products/${product.handle}`}
        className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--surface-elevated)]"
        aria-label={`View ${product.title}`}
      >
        <SafeImage src={product.featuredImage} alt={product.title} fill className="object-cover" />
      </Link>

      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm leading-tight text-[var(--forest)]">{product.title}</p>
        <p className="line-clamp-2 text-[10.5px] leading-snug text-[var(--muted)]">{reason}</p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <p className="whitespace-nowrap text-[11px] tabular-nums text-[var(--forest)]">
          {formatMoney(product.price, product.currency)}
        </p>
        <button
          type="button"
          onClick={() => onAdd(rec)}
          className="rounded-full bg-[var(--forest)] px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-white transition hover:scale-[1.04]"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function ThinkingVesicle() {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex justify-start"
    >
      <div
        className="flex items-center gap-1.5 rounded-full px-4 py-3"
        style={{
          background:
            "radial-gradient(circle at 28% 22%, #fffaf0 0%, #f5d7a8 60%, #e5b773 100%)",
          border: "1px solid rgba(229,183,115,0.62)",
          boxShadow: "0 10px 26px rgba(229,183,115,0.22), inset 0 0 22px rgba(255,255,255,0.55)",
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block h-1.5 w-1.5 rounded-full bg-[#0c1f1c]/45"
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.1,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.18,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function FloatingDust() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-[#e5b773]/45 shadow-[0_0_10px_rgba(229,183,115,0.5)]"
          style={{ left: `${(i * 17 + 9) % 92}%`, top: `${(i * 29 + 12) % 78}%` }}
          animate={{ y: [-6, 6, -6], opacity: [0.25, 0.7, 0.25] }}
          transition={{
            duration: 6 + (i % 3) * 1.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}
    </div>
  );
}

