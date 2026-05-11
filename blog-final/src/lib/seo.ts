export const siteName = "The Signal Ledger";
export const siteDescription = "Sharp technology reporting, product strategy, and systems thinking for builders.";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  return `${getSiteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
