import { useEffect, useState } from "react";
import { Activity, Bot, Clock3, Skull } from "lucide-react";
import {
  getMuseumDisplayStats,
  recordMuseumEvent,
  subscribeMuseumStats,
  type DisplayStats,
} from "@/lib/museum-stats";

function formatNum(n: number) {
  return new Intl.NumberFormat("ja-JP").format(Math.floor(n));
}

const FALLBACK: DisplayStats = {
  hoursLost: 48_291_402,
  aiTokens: 1_842_003_771,
  weirdDeps: 9_412,
  sanity: 37.4,
  raw: {
    visits: 0,
    interactions: 0,
    indentOps: 0,
    aiOps: 0,
    depOps: 0,
    toolOps: 0,
    shareOps: 0,
    joyOps: 0,
    posts: 0,
  },
};

export function CostTicker() {
  const [stats, setStats] = useState<DisplayStats>(FALLBACK);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        // One visit per browser tab session (avoids StrictMode double-count)
        const key = "museum-visit-v1";
        let next: DisplayStats | null = null;
        if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, "1");
          next = await recordMuseumEvent("visit");
        } else {
          next = await getMuseumDisplayStats();
        }
        if (!cancelled && next) {
          setStats(next);
          setReady(true);
        }
      } catch {
        if (!cancelled) setReady(true);
      }
    }

    void boot();

    const unsub = subscribeMuseumStats((s) => {
      if (!cancelled) {
        setStats(s);
        setReady(true);
      }
    });

    // Poll so other visitors' irreversible damage shows up
    const poll = window.setInterval(() => {
      void getMuseumDisplayStats()
        .then((s) => {
          if (!cancelled) setStats(s);
        })
        .catch(() => {});
    }, 8000);

    return () => {
      cancelled = true;
      unsub();
      window.clearInterval(poll);
    };
  }, []);

  const cards = [
    {
      label: "人類が失った時間（時間）",
      value: formatNum(stats.hoursLost),
      icon: Clock3,
      hint: "IndentationError を直している累計",
    },
    {
      label: "無駄にされた AI トークン",
      value: formatNum(stats.aiTokens),
      icon: Bot,
      hint: "ログだけ渡してトンチンカンを生成",
    },
    {
      label: "意味不明な依存パッケージ",
      value: formatNum(stats.weirdDeps),
      icon: Activity,
      hint: "import 名と配布名が一致しない件数",
    },
    {
      label: "残存正気度",
      value: `${stats.sanity.toFixed(1)}%`,
      icon: Skull,
      hint: "専用ツールを開くたびに減少",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((s) => (
        <article
          key={s.label}
          className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
        >
          <div className="mb-3 flex items-center gap-2 text-[var(--color-subtle)]">
            <s.icon className="h-4 w-4" aria-hidden />
            <span className="text-xs font-medium tracking-wide">{s.label}</span>
          </div>
          <p
            className={`font-display text-2xl font-semibold tabular text-[var(--color-fg)] sm:text-3xl transition-opacity ${
              ready ? "opacity-100" : "opacity-70"
            }`}
          >
            {s.value}
          </p>
          <p className="mt-2 text-xs text-[var(--color-muted)]">{s.hint}</p>
          {s.label.startsWith("残存") && (
            <p className="mt-1 text-[10px] text-[var(--color-subtle)]">
              来館 {stats.raw.visits} · 操作 {stats.raw.interactions}
            </p>
          )}
        </article>
      ))}
    </section>
  );
}
