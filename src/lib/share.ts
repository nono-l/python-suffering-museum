const SHARE_TEXT =
  "Python 受苦博物館 — Pythonがいかに非生産的で、人間を苦しめ、AIを無駄にし、世界の敵であるか";

const VERDICT_SHARE_TEXT =
  "【判決】Python は書くのが楽しいだけのカス言語。運用税・インデント罠・依存地獄・GIL・AI浪費を展示する博物館へ →";

function normalizeHost(host: string): string {
  return host.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** Public site URL for share cards / intents (no hash). */
export function getShareUrl(): string {
  const envHost = import.meta.env.VITE_PUBLIC_HOSTNAME as string | undefined;
  if (envHost) {
    return `https://${normalizeHost(envHost)}/`;
  }
  if (typeof window === "undefined") return "";
  try {
    return `${new URL(window.location.href).origin}/`;
  } catch {
    return window.location.href.split("#")[0] ?? window.location.href;
  }
}

/**
 * X (Twitter) Web Intent URL.
 * `text` only — URL is folded into the body so compose always shows a link
 * (some clients ignore a separate `url` param).
 */
export function getXIntentUrl(text: string = SHARE_TEXT, pageUrl?: string): string {
  const url = pageUrl ?? getShareUrl();
  const body = url ? `${text}\n${url}` : text;
  const params = new URLSearchParams();
  params.set("text", body);
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

export function getVerdictXIntentUrl(): string {
  return getXIntentUrl(VERDICT_SHARE_TEXT);
}

/** Prefer real intent navigation — UI says "Xでシェア", not OS share sheet. */
export function openXIntent(text: string = SHARE_TEXT): "x" {
  const intent = getXIntentUrl(text);
  window.open(intent, "_blank", "noopener,noreferrer");
  return "x";
}

export async function shareMuseum(text: string = SHARE_TEXT): Promise<"x"> {
  openXIntent(text);
  return "x";
}

export { SHARE_TEXT, VERDICT_SHARE_TEXT };
