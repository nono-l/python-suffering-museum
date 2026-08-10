import { useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

export function JoyCost() {
  const [pleasure, setPleasure] = useState(78);
  const lastBump = useRef(0);

  const data = useMemo(() => {
    const points = [];
    for (let year = 0; year <= 10; year += 1) {
      const joy = Math.max(8, pleasure - year * (pleasure * 0.07) + Math.sin(year) * 2);
      const tax =
        12 +
        year * year * (0.9 + pleasure / 120) +
        (pleasure > 70 ? year * 4 : year * 2);
      const aiWaste = tax * (0.4 + pleasure / 200) * (year + 1);
      points.push({
        year: `Y${year}`,
        joy: Math.round(joy),
        tax: Math.round(tax),
        aiWaste: Math.round(aiWaste),
      });
    }
    return points;
  }, [pleasure]);

  const final = data[data.length - 1];
  const verdict =
    pleasure >= 70
      ? "書く快感を最大化するほど、後年の運用税と AI 浪費が指数的に膨らむ。"
      : pleasure >= 40
        ? "快感を抑えても、依存と観測不能性の固定費は残る。"
        : "快感を捨てても、言語の構造的コストはゼロにならない。";

  function onPleasureChange(v: number) {
    setPleasure(v);
    const now = Date.now();
    // Throttle DB bumps while dragging
    if (now - lastBump.current > 800) {
      lastBump.current = now;
      void recordMuseumEvent("joy");
    }
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
        EXHIBIT 02
      </p>
      <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
        書く快感 vs 運用税
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
        「書く瞬間の快感」のために設計され、その快感を最大化する方向へ破壊的変更が繰り返される。
        快感スライダーを動かして、10年後のコスト曲線を観察してください。
      </p>

      <div className="mt-5 grid gap-6 lg:grid-cols-[240px_1fr]">
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-[var(--color-subtle)]">
              書く瞬間の快感
            </span>
            <div className="mt-2 flex items-end justify-between">
              <span className="font-display text-3xl font-semibold tabular">
                {pleasure}
              </span>
              <span className="text-xs text-[var(--color-muted)]">/ 100</span>
            </div>
            <input
              type="range"
              min={10}
              max={100}
              value={pleasure}
              onChange={(e) => onPleasureChange(Number(e.target.value))}
              className="mt-3 w-full accent-[var(--color-danger)]"
            />
          </label>

          <div className="space-y-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">10年後の運用税</span>
              <span className="tabular font-medium text-[var(--color-warn)]">
                {final?.tax}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">AI 浪費指数</span>
              <span className="tabular font-medium text-[var(--color-danger)]">
                {final?.aiWaste}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-muted)]">残る快感</span>
              <span className="tabular font-medium">{final?.joy}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                setPleasure(92);
                void recordMuseumEvent("joy");
              }}
            >
              快感最大化
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setPleasure(35);
                void recordMuseumEvent("joy");
              }}
            >
              禁欲モード
            </Button>
          </div>
        </div>

        <div className="h-64 w-full min-w-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-2 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="joyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a1a1aa" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#a1a1aa" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="taxFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f07178" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f07178" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2a2a30" strokeDasharray="3 3" />
              <XAxis dataKey="year" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} width={32} />
              <Tooltip
                contentStyle={{
                  background: "#121214",
                  border: "1px solid #2a2a30",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="joy"
                name="書く快感"
                stroke="#a1a1aa"
                fill="url(#joyFill)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="tax"
                name="運用税"
                stroke="#f07178"
                fill="url(#taxFill)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="aiWaste"
                name="AI浪費"
                stroke="#d4a574"
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="mt-4 border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-muted)]">
        {verdict}
      </p>
    </section>
  );
}
