const SHARE_TEXT =
  "Python 受苦博物館 — Pythonがいかに非生産的で、人間を苦しめ、AIを無駄にし、世界の敵であるか";

export function getShareUrl(): string {
  if (typeof window === "undefined") return "";
  const host = import.meta.env.VITE_PUBLIC_HOSTNAME as string | undefined;
  if (host) return `https://${host}/`;
  return window.location.href.split("#")[0] ?? window.location.href;
}

export function getXIntentUrl(text: string = SHARE_TEXT): string {
  const url = getShareUrl();
  const params = new URLSearchParams();
  params.set("text", text);
  if (url) params.set("url", url);
  return `https://x.com/intent/tweet?${params.toString()}`;
}

export async function shareMuseum(): Promise<"native" | "x" | "copied"> {
  const url = getShareUrl();
  const title = "Python 受苦博物館";

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text: SHARE_TEXT, url });
      return "native";
    } catch (err) {
      // User cancelled or share failed — fall through
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
    }
  }

  const intent = getXIntentUrl();
  const opened = window.open(intent, "_blank", "noopener,noreferrer");
  if (opened) return "x";

  // Popup blocked — copy URL as last resort
  try {
    await navigator.clipboard.writeText(`${SHARE_TEXT}\n${url}`);
    return "copied";
  } catch {
    window.location.href = intent;
    return "x";
  }
}

export { SHARE_TEXT };
