import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, Landmark } from "lucide-react";
import { CostTicker } from "@/components/museum/cost-ticker";
import { IndentTrap } from "@/components/museum/indent-trap";
import { JoyCost } from "@/components/museum/joy-cost";
import { DepHell } from "@/components/museum/dep-hell";
import { AiWaste } from "@/components/museum/ai-waste";
import { ToolSprawl } from "@/components/museum/tool-sprawl";
import { MutableDefault } from "@/components/museum/mutable-default";
import { GilLie } from "@/components/museum/gil-lie";
import { Verdict } from "@/components/museum/verdict";
import { ShareButton } from "@/components/museum/share-button";
import { AuthSlot } from "@/components/museum/auth-slot";
import { BoardPanel } from "@/components/museum/board-panel";

export const Route = createFileRoute("/")({
  component: MuseumHome,
});

function MuseumHome() {
  return (
    <div className="min-h-dvh bg-[var(--color-bg)] text-[var(--color-fg)]">
      <header className="border-b border-[var(--color-border)] pt-[var(--grok-banner-h,0px)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Landmark className="h-5 w-5 shrink-0 text-[var(--color-danger)]" aria-hidden />
            <span className="truncate text-sm font-medium tracking-wide">
              Python 受苦博物館
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="hidden items-center gap-4 text-xs text-[var(--color-muted)] md:flex">
              <a href="#exhibits" className="hover:text-[var(--color-fg)]">
                展示
              </a>
              <a href="#verdict" className="hover:text-[var(--color-fg)]">
                判決
              </a>
              <Link to="/board" className="hover:text-[var(--color-fg)]">
                掲示板
              </Link>
            </nav>
            <ShareButton size="sm" variant="outline" />
            <AuthSlot />
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
          <p className="text-xs font-medium tracking-[0.2em] text-[var(--color-danger)]">
            INTERACTIVE INDICTMENT
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-balance text-3xl font-semibold leading-tight sm:text-5xl">
            Python がいかに非生産的で、
            <span className="text-[var(--color-danger)]">人間を苦しめ</span>、
            AI を無駄にし、
            <span className="text-[var(--color-danger)]">世界の敵</span>
            であるか
          </h1>
          <p className="mt-5 max-w-2xl text-base text-[var(--color-muted)] sm:text-lg">
            これはチュートリアルではない。書く快感の裏で積み上がる運用税、壊れた空白、
            嘘のパッケージ名、ログに沈黙する失敗、そして空転する知能——
            それらを手で壊し、測り、告発するための博物館です。
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#exhibits"
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border-strong)] bg-[var(--color-elevated)] px-4 text-sm font-medium transition-colors hover:bg-[var(--color-surface)]"
            >
              展示へ進む
              <ArrowDown className="h-4 w-4" />
            </a>
            <Link
              to="/board"
              className="inline-flex h-11 items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] px-4 text-sm font-medium text-[var(--color-muted)] transition-colors hover:bg-[var(--color-elevated)] hover:text-[var(--color-fg)]"
            >
              来館者掲示板
            </Link>
            <ShareButton size="default" variant="secondary" label="この告発をXでシェア" />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <CostTicker />
        </section>

        <div id="exhibits" className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-10 sm:px-6">
          <IndentTrap />
          <JoyCost />
          <DepHell />
          <AiWaste />
          <ToolSprawl />
          <MutableDefault />
          <GilLie />
          <div id="verdict">
            <Verdict />
          </div>
          <div id="board">
            <BoardPanel />
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--color-border)] py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-[var(--color-subtle)]">
            本館は風刺と設計思想批判のための展示です。Python で食っている人々への敬意と、
            それでもなお残る構造的コストへの告発は両立します。
          </p>
          <div className="flex items-center gap-2">
            <Link
              to="/board"
              className="text-xs text-[var(--color-muted)] hover:text-[var(--color-fg)]"
            >
              掲示板
            </Link>
            <ShareButton size="sm" variant="ghost" label="シェア" />
          </div>
        </div>
      </footer>
    </div>
  );
}
