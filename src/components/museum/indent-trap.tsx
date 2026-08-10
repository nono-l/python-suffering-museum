import { useMemo, useState } from "react";
import { AlertTriangle, Eraser, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const SAMPLE = `def calculate_tax(income):
    if income > 1000000:
        rate = 0.45
        bonus = income * 0.02
    else:
        rate = 0.2
        bonus = 0
    return income * rate + bonus

class Payroll:
    def run(self, employees):
        total = 0
        for e in employees:
            total += calculate_tax(e.salary)
        return total`;

function corruptWhitespace(src: string, mode: "strip" | "tabs" | "collapse") {
  if (mode === "strip") {
    return src
      .split("\n")
      .map((line) => line.replace(/^\s+/, ""))
      .join("\n");
  }
  if (mode === "tabs") {
    return src
      .split("\n")
      .map((line, i) => {
        const m = line.match(/^(\s*)/);
        const indent = m?.[1] ?? "";
        const rest = line.slice(indent.length);
        if (!indent) return line;
        if (i % 2 === 0) return "\t".repeat(Math.ceil(indent.length / 4)) + rest;
        return "  " + "\t" + rest;
      })
      .join("\n");
  }
  return src.replace(/\n {2,}/g, "\n ").replace(/\t/g, " ");
}

export function IndentTrap() {
  const [code, setCode] = useState(SAMPLE);
  const [log, setLog] = useState<string | null>(null);

  const brokenness = useMemo(() => {
    const lines = code.split("\n");
    let mixed = 0;
    for (const line of lines) {
      if (line.includes("\t") && line.includes("  ")) mixed += 1;
    }
    const bodyLines = lines.filter((l) => l.trim().length > 0);
    const unindentedBody = bodyLines.filter(
      (l) =>
        !/^(def|class|if|else|elif|for|while|return|import|from|#)/.test(l.trim()) &&
        !/^\s/.test(l),
    ).length;
    const score = Math.min(100, mixed * 18 + unindentedBody * 12);
    return { mixed, zeroIndentBlocks: unindentedBody, score };
  }, [code]);

  function attack(mode: "strip" | "tabs" | "collapse") {
    const next = corruptWhitespace(code, mode);
    setCode(next);
    const messages = {
      strip:
        "フロントエンドが leading whitespace を「ゴミ」として削除しました。構造情報が消滅。IndentationError 確定。",
      tabs: "タブとスペースを混在させました。見た目は同じでも Python は別物として扱います。",
      collapse:
        "HTML / メール / textarea 経路が空白を畳みました。ブロック境界が溶解しています。",
    };
    setLog(messages[mode]);
    void recordMuseumEvent("indent");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            EXHIBIT 01
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            インデント罠 — 空白がセマンティクス
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
            括弧を捨て、見えない空白に構造を預けた設計。多くのフロントエンド・メール・コピー経路は
            その空白を「意味のないゴミ」として破壊します。
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-3 py-2 text-right">
          <p className="text-xs text-[var(--color-muted)]">構造破壊度</p>
          <p className="font-display text-2xl font-semibold tabular text-[var(--color-danger)]">
            {brokenness.score}%
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Button type="button" variant="danger" size="sm" onClick={() => attack("strip")}>
          <Eraser className="h-4 w-4" />
          インデントをゴミとして削除
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => attack("tabs")}>
          タブとスペースを混在
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => attack("collapse")}>
          フロントエンドが空白を畳む
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setCode(SAMPLE);
            setLog(null);
          }}
        >
          <RotateCcw className="h-4 w-4" />
          復元
        </Button>
      </div>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        className="min-h-56 w-full resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-4 font-mono text-xs leading-relaxed text-[var(--color-fg)] outline-none focus:border-[var(--color-border-strong)] sm:text-sm"
        aria-label="Python sample code"
      />

      {log && (
        <div className="mt-3 flex gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-3 text-sm text-[var(--color-muted)]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warn)]" />
          <p>{log}</p>
        </div>
      )}
    </section>
  );
}
