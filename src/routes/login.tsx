import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

type LoginSearch = {
  redirect?: string;
  error?: string;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { redirect, error: urlError } = Route.useSearch();
  const callbackURL =
    redirect && redirect.startsWith("/") ? redirect : "/board";
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(urlError ?? null);

  async function onProvider(providerId: string) {
    setError(null);
    setBusy(providerId);
    try {
      await signIn(providerId, {
        callbackURL,
        errorCallbackURL: `/login?error=sign_in_failed&redirect=${encodeURIComponent(callbackURL)}`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "ログインに失敗しました";
      if (/pop-?up/i.test(msg)) {
        setError(
          "ポップアップがブロックされました。ブラウザでこのサイトのポップアップを許可してから、もう一度お試しください。",
        );
      } else if (/cancel/i.test(msg)) {
        setError("ログインがキャンセルされました。");
      } else {
        setError(msg);
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--color-bg)] px-4 pt-[var(--grok-banner-h,0px)] text-[var(--color-fg)]">
      <div className="w-full max-w-sm space-y-5 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            ACCOUNT
          </p>
          <h1 className="font-display mt-1 text-xl font-semibold">アカウント連携</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Google または X でログインすると、来館者掲示板に書き込めます。展示の閲覧はログイン不要です。
          </p>
          <p className="mt-2 text-xs text-[var(--color-subtle)]">
            プレビュー内ではログイン用のポップアップが開きます。ブロックされている場合は許可してください。
          </p>
        </div>
        {error && (
          <p
            className="rounded-[var(--radius-sm)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-3 py-2 text-sm text-[var(--color-danger)]"
            role="alert"
          >
            {error}
          </p>
        )}
        {authEnabled ? (
          <div className="space-y-2">
            {GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant="secondary"
                className="w-full"
                disabled={busy !== null}
                onClick={() => void onProvider(p.providerId)}
              >
                {busy === p.providerId ? "接続中…" : `${p.label} で続ける`}
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">サインインは無効です。</p>
        )}
        <div className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-4 text-center text-sm">
          <Link to="/board" className="text-[var(--color-muted)] hover:text-[var(--color-fg)]">
            掲示板を見る
          </Link>
          <Link to="/" className="text-[var(--color-subtle)] hover:text-[var(--color-fg)]">
            博物館に戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
