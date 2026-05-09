function normalizeHost(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      return new URL(trimmed).hostname;
    } catch {
      return null;
    }
  }
  return trimmed.replace(/\/+$/, "");
}

function getPublicAllowedHosts(): Set<string> {
  const hosts = new Set<string>(["cymbiotika.com", "www.cymbiotika.com"]);
  const envHosts = [
    process.env.SHOPIFY_STORE_DOMAIN,
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN,
    process.env.NEXT_PUBLIC_SHOPIFY_CHECKOUT_DOMAIN,
  ];

  for (const value of envHosts) {
    const normalized = normalizeHost(value);
    if (normalized) hosts.add(normalized);
  }

  return hosts;
}

export function assertPublicCymbiotikaUrl(url: string): void {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Unsupported protocol for ${url}`);
  }

  const publicAllowedHosts = getPublicAllowedHosts();
  if (!publicAllowedHosts.has(parsed.hostname)) {
    throw new Error(`Disallowed host for public fetch: ${parsed.hostname}`);
  }
}

export async function safePublicFetch(url: string, init?: RequestInit): Promise<Response> {
  assertPublicCymbiotikaUrl(url);
  return fetch(url, init);
}
