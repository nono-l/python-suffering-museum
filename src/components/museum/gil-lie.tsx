import { useEffect, useMemo, useRef, useState } from "react";
import { Cpu, Lock, Play, Square, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

type Mode = "gil" | "free";

type ThreadState = {
  id: number;
  progress: number; // 0..100
  holding: boolean;
  done: boolean;
};

const WORK_UNITS = 100;
const CORES = 4;

export function GilLie() {
  const [mode, setMode] = useState<Mode>("gil");
  const [threadCount, setThreadCount] = useState(4);
  const [running, setRunning] = useState(false);
  const [threads, setThreads] = useState<ThreadState[]>(() => makeThreads(4));
  const [elapsed, setElapsed] = useState(0);
  const [holder, setHolder] = useState<number | null>(null);
  const startedAt = useRef(0);
  const raf = useRef(0);
  const stateRef = useRef({ threads: makeThreads(4), holder: null as number | null, mode: "gil" as Mode });

  function makeThreads(n: number): ThreadState[] {
    return Array.from({ length: n }, (_, i) => ({
      id: i + 1,
      progress: 0,
      holding: false,
      done: false,
    }));
  }

  function reset(n = threadCount, m = mode) {
    cancelAnimationFrame(raf.current);
    setRunning(false);
    setElapsed(0);
    setHolder(null);
    const t = makeThreads(n);
    setThreads(t);
    stateRef.current = { threads: t, holder: null, mode: m };
  }

  function start() {
    if (running) return;
    reset(threadCount, mode);
    const t = makeThreads(threadCount);
    stateRef.current = { threads: t, holder: null, mode };
    setThreads(t);
    setRunning(true);
    startedAt.current = performance.now();
    void recordMuseumEvent("interaction");

    const tick = (now: number) => {
      const s = stateRef.current;
      const dt = 16; // ~60fps step units
      // GIL: one holder advances; free: all advance (capped by cores conceptually via speed)
      let holderId = s.holder;
      const next = s.threads.map((th) => ({ ...th }));

      if (s.mode === "gil") {
        // Round-robin GIL: only one thread runs Python bytecode at a time
        if (holderId == null || next.find((t) => t.id === holderId)?.done) {
          const waiting = next.filter((t) => !t.done);
          holderId = waiting.length ? waiting[Math.floor(Math.random() * waiting.length)]!.id : null;
        }
        // occasionally release GIL and reacquire (context switch tax)
        if (Math.random() < 0.08 && holderId != null) {
          const waiting = next.filter((t) => !t.done && t.id !== holderId);
          if (waiting.length) {
            holderId = waiting[Math.floor(Math.random() * waiting.length)]!.id;
          }
        }
        for (const th of next) {
          th.holding = th.id === holderId;
          if (th.holding && !th.done) {
            th.progress = Math.min(WORK_UNITS, th.progress + dt * 0.55);
            if (th.progress >= WORK_UNITS) {
              th.done = true;
              th.holding = false;
              holderId = null;
            }
          }
        }
      } else {
        // Free-threaded idealization: up to CORES true parallel workers
        const active = next.filter((t) => !t.done).slice(0, CORES);
        const activeIds = new Set(active.map((t) => t.id));
        for (const th of next) {
          th.holding = activeIds.has(th.id);
          if (th.holding && !th.done) {
            th.progress = Math.min(WORK_UNITS, th.progress + dt * 0.55);
            if (th.progress >= WORK_UNITS) {
              th.done = true;
              th.holding = false;
            }
          }
        }
        holderId = active[0]?.id ?? null;
      }

      s.threads = next;
      s.holder = holderId;
      setThreads(next.map((t) => ({ ...t })));
      setHolder(holderId);
      setElapsed(now - startedAt.current);

      if (next.every((t) => t.done)) {
        setRunning(false);
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
  }

  function stop() {
    cancelAnimationFrame(raf.current);
    setRunning(false);
  }

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const allDone = threads.length > 0 && threads.every((t) => t.done);
  const speedup = useMemo(() => {
    // Theoretical serial time ~ threadCount units; measure wall elapsed vs naive serial estimate
    if (!allDone || elapsed <= 0) return null;
    const serialEstimate = threadCount * 1800; // rough ms scale from animation rate
    return (serialEstimate / elapsed).toFixed(2);
  }, [allDone, elapsed, threadCount]);

  const coresVisual = Array.from({ length: CORES }, (_, i) => {
    if (mode === "gil") {
      // Only core 0 ever busy under GIL for pure-Python CPU work
      return holder != null && i === 0;
    }
    const active = threads.filter((t) => t.holding && !t.done);
    return i < active.length;
  });

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            EXHIBIT 07
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            GIL — 並列性の虚偽広告
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
            CPython の Global Interpreter Lock は、同時に Python バイトコードを実行できるスレッドを
            実質1本に制限する。スレッドを4本にしても、CPU バウンドな仕事はほぼ1コアで順番待ち。
            「並列」と書いて「直列」と読む。
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-3 py-2 text-right">
          <p className="text-xs text-[var(--color-muted)]">経過時間</p>
          <p className="font-display text-2xl font-semibold tabular text-[var(--color-danger)]">
            {(elapsed / 1000).toFixed(2)}s
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "gil" ? "danger" : "outline"}
          disabled={running}
          onClick={() => {
            setMode("gil");
            reset(threadCount, "gil");
          }}
        >
          <Lock className="h-4 w-4" />
          GIL あり（現実）
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "free" ? "secondary" : "outline"}
          disabled={running}
          onClick={() => {
            setMode("free");
            reset(threadCount, "free");
          }}
        >
          <Zap className="h-4 w-4" />
          理想の並列（比較）
        </Button>
        <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1">
          <span className="text-xs text-[var(--color-subtle)]">スレッド</span>
          {[2, 4, 8].map((n) => (
            <button
              key={n}
              type="button"
              disabled={running}
              onClick={() => {
                setThreadCount(n);
                reset(n, mode);
              }}
              className={`h-8 min-w-8 rounded px-2 text-xs tabular ${
                threadCount === n
                  ? "bg-[var(--color-elevated)] font-medium text-[var(--color-fg)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-fg)]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        {!running ? (
          <Button type="button" size="sm" variant="secondary" onClick={start}>
            <Play className="h-4 w-4" />
            CPU 仕事を走らせる
          </Button>
        ) : (
          <Button type="button" size="sm" variant="ghost" onClick={stop}>
            <Square className="h-4 w-4" />
            停止
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <div className="space-y-3">
          <p className="text-xs font-medium text-[var(--color-subtle)]">スレッド進捗</p>
          <ul className="space-y-2">
            {threads.map((th) => (
              <li key={th.id}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-mono text-[var(--color-muted)]">
                    Thread-{th.id}
                    {th.holding && !th.done && (
                      <span className="ml-2 text-[var(--color-danger)]">
                        {mode === "gil" ? "GIL 保持中" : "実行中"}
                      </span>
                    )}
                    {th.done && (
                      <span className="ml-2 text-[var(--color-subtle)]">完了</span>
                    )}
                  </span>
                  <span className="tabular text-[var(--color-subtle)]">
                    {Math.floor(th.progress)}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--color-mono-bg)]">
                  <div
                    className="h-full rounded-full transition-[width] duration-75"
                    style={{
                      width: `${th.progress}%`,
                      background: th.holding
                        ? "var(--color-danger)"
                        : th.done
                          ? "#52525b"
                          : "#3f3f46",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs text-[var(--color-subtle)]">
            <Cpu className="h-4 w-4" />
            論理コア使用（模式）
          </div>
          <div className="grid grid-cols-2 gap-2">
            {coresVisual.map((busy, i) => (
              <div
                key={i}
                className={`flex h-14 flex-col items-center justify-center rounded-[var(--radius-sm)] border text-xs ${
                  busy
                    ? "border-[var(--color-danger)] bg-[var(--color-danger-dim)] text-[var(--color-danger)]"
                    : "border-[var(--color-border)] bg-[var(--color-mono-bg)] text-[var(--color-subtle)]"
                }`}
              >
                <span className="font-mono">Core {i}</span>
                <span className="mt-0.5">{busy ? "BUSY" : "idle"}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-[var(--color-muted)]">
            {mode === "gil"
              ? "GIL 下では純粋 Python の CPU 仕事が Core 0 に集中。他コアは暇。"
              : "理想並列では最大4コアが同時に進む。CPython の長年の約束と現実の差。"}
          </p>
          {allDone && speedup && (
            <p className="mt-2 border-t border-[var(--color-border)] pt-2 text-xs text-[var(--color-warn)]">
              目安スピードアップ ×{speedup}
              {mode === "gil"
                ? " — スレッドを増やしてもほぼ直列。"
                : " — 並列が効いた比較用シミュレーション。"}
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-muted)]">
        3.13〜3.14 で free-threaded ビルドが現実味を帯びても、生態系（拡張モジュール・慣習・デプロイ）が
        追いつくまで「スレッド＝並列」という広告は嘘のままだった。何十年分のワークアラウンド税は戻ってこない。
      </p>
    </section>
  );
}
