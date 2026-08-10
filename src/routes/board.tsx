import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Landmark } from "lucide-react";
import { BoardPanel } from "@/components/museum/board-panel";
import { AuthSlot } from "@/components/museum/auth-slot";
import { ShareButton } from "@/components/museum/share-button";

export const Route = createFileRoute("/board")({
  component: BoardPage,
  head: () => ({
    meta: [{ title: "来館者掲示板 — Python 受苦博物館" }],
  }),
});

function BoardPage() {
  return (
    <div className="min-h-dvh bg-[var(--color-bg)] text-[var(--color-fg)]">
      <header className="border-b border-[var(--color-border)] pt-[var(--grok-banner-h,0px)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 text-sm font-medium tracking-wide hover:opacity-90"
          >
            <Landmark className="h-5 w-5 shrink-0 text-[var(--color-danger)]" />
            <span className="truncate">Python 受苦博物館</span>
          </Link>
          <div className="flex items-center gap-2">
            <ShareButton size="sm" variant="ghost" label="シェア" />
            <AuthSlot />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          展示に戻る
        </Link>
        <BoardPanel />
      </main>
    </div>
  );
}
