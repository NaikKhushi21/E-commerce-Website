/**
 * Shared Sanity GROQ client.
 *
 * Pattern matches the rest of this app's data layer: raw fetch (no @sanity/client
 * dependency), env-driven, graceful fallback. All sanity-* fetch helpers in
 * src/lib/ should use {@link sanityQuery} so the env contract stays in one place.
 */

const DEFAULT_API_VERSION = "2023-10-01";

function resolveApiVersion(value: string | undefined): string {
  if (!value) return DEFAULT_API_VERSION;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return DEFAULT_API_VERSION;
  const today = new Date().toISOString().slice(0, 10);
  if (value > today) return DEFAULT_API_VERSION;
  return value;
}

export const SANITY_API_VERSION = resolveApiVersion(
  process.env.NEXT_PUBLIC_SANITY_API_VERSION,
);
export const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const SANITY_DATASET =
  process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
export const SANITY_READ_TOKEN = process.env.SANITY_API_READ_TOKEN;

/** True when Sanity creds are configured enough to attempt a request. */
export function sanityIsConfigured(): boolean {
  return Boolean(SANITY_PROJECT_ID && SANITY_DATASET);
}

/**
 * Run a GROQ query against the configured Sanity project.
 * Returns null if creds are missing or the request fails — callers should fall
 * back to local seed data in that case.
 */
export async function sanityQuery<T>(query: string): Promise<T | null> {
  if (!sanityIsConfigured()) return null;

  try {
    const encoded = encodeURIComponent(query);
    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${encoded}`;
    const res = await fetch(url, {
      headers: SANITY_READ_TOKEN
        ? { Authorization: `Bearer ${SANITY_READ_TOKEN}` }
        : undefined,
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { result?: unknown };
    return (json.result ?? null) as T | null;
  } catch {
    return null;
  }
}
