"use client";

import { FormEvent, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/data/products";
import { cn } from "@/lib/cn";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ProductAskButtonProps = {
  product: Product;
  className?: string;
  label?: string;
};

const QUICK_PROMPTS = [
  "What is this best for?",
  "How do I use it?",
  "Is this right for my goal?",
];

const subscribeNoop = () => () => {};

function productPayload(product: Product) {
  return {
    title: product.title,
    description: product.description,
    benefits: product.benefits,
    ingredients: product.ingredients,
    price: product.price,
    currency: product.currency,
    category: product.category,
    productType: product.productType,
    tags: product.tags,
  };
}

export function ProductAskButton({ product, className, label = "Ask" }: ProductAskButtonProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const context = useMemo(() => productPayload(product), [product]);
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/product-ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: context, messages: nextMessages }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Assistant request failed.");
      }

      setMessages((current) => [...current, { role: "assistant", content: data.answer }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assistant request failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  const modal = (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[rgba(18,18,18,0.18)] p-4 backdrop-blur-[3px] md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`Ask about ${product.title}`}
            initial={{ opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-[min(760px,86svh)] w-full max-w-[620px] flex-col overflow-hidden rounded-[1.8rem] border border-white/60 bg-[rgba(250,249,245,0.92)] shadow-[0_34px_110px_rgba(18,18,18,0.18)] backdrop-blur-2xl"
          >
            <header className="border-b border-[var(--line)] px-5 py-4 md:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="micro-copy text-[var(--muted)]">Product Assistant</p>
                  <h2 className="mt-2 font-display text-3xl leading-none text-[var(--primary)] md:text-4xl">Ask about {product.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-[var(--line)] bg-white/58 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-[var(--primary)]"
                >
                  Close
                </button>
              </div>
            </header>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5 md:px-6">
              {messages.length === 0 ? (
                <div className="rounded-[1.4rem] border border-white/70 bg-white/58 p-4 text-sm leading-relaxed text-[var(--muted)]">
                  Ask a simple question about benefits, ingredients, usage, or whether this product fits your routine. This assistant is informational and not medical advice.
                </div>
              ) : null}

              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[86%] rounded-[1.2rem] px-4 py-3 text-sm leading-relaxed",
                      message.role === "user"
                        ? "bg-[var(--primary)] text-[var(--on-primary)]"
                        : "border border-white/70 bg-white/68 text-[var(--primary)]",
                    )}
                  >
                    {message.content}
                  </div>
                </div>
              ))}

              {loading ? <p className="text-sm text-[var(--muted)]">Thinking...</p> : null}
              {error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
            </div>

            <div className="border-t border-[var(--line)] px-5 py-4 md:px-6">
              <div data-lenis-prevent className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    disabled={loading}
                    className="shrink-0 rounded-full border border-[var(--line)] bg-white/56 px-3 py-1.5 text-xs text-[var(--primary)] disabled:opacity-45"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about this product..."
                  className="min-w-0 flex-1 rounded-full border border-[var(--line)] bg-white/72 px-4 py-3 text-sm text-[var(--primary)] outline-none focus:border-[var(--primary)]"
                />
                <button
                  type="submit"
                  disabled={loading || input.trim().length === 0}
                  className="rounded-full bg-[var(--primary)] px-5 py-3 text-xs uppercase tracking-[0.14em] text-[var(--on-primary)] disabled:opacity-45"
                >
                  Send
                </button>
              </form>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "rounded-full border border-[var(--line-strong)] bg-white/40 px-4 py-2.5 text-xs uppercase tracking-[0.14em] text-[var(--primary)] transition duration-500 [transition-timing-function:var(--easing-premium)] hover:bg-white/80",
          className,
        )}
      >
        {label}
      </button>
      {mounted ? createPortal(modal, document.body) : null}
    </>
  );
}
