import { useState } from "react";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const TOOLS = [
  { name: "pip", role: "入れたつもり" },
  { name: "venv", role: "隔離したつもり" },
  { name: "virtualenv", role: "別の隔離" },
  { name: "pyenv", role: "本体の版" },
  { name: "poetry", role: "ロックしたつもり" },
  { name: "pipenv", role: "かつて流行" },
  { name: "conda", role: "別世界の依存" },
  { name: "pdm", role: "また別の正解" },
  { name: "hatch", role: "ビルドもやる" },
  { name: "uv", role: "全部まとめる新星" },
  { name: "pip-tools", role: "requirements 生成" },
  { name: "setuptools", role: "まだいる" },
  { name: "wheel", role: "配布形式" },
  { name: "twine", role: "アップロード" },
  { name: "tox", role: "行列テスト" },
  { name: "nox", role: "tox の親戚" },
];

export function ToolSprawl() {
  const [count, setCount] = useState(4);
  const visible = TOOLS.slice(0, count);
  const confusion = Math.min(100, Math.round((count / TOOLS.length) * 100 + count * 2));

  function addTools() {
    setCount((c) => Math.min(TOOLS.length, c + 2));
    void recordMuseumEvent("tool");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
        EXHIBIT 05
      </p>
      <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
        専用ツール群 — なければ不明、あっても狂気
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
        言語が自分の構造を人間に直接見せることをやめた結果、理解の窓口がツールに外部化された。
        ツールは増え、置き換わり、互いに相容れない。
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={addTools}
          disabled={count >= TOOLS.length}
        >
          <Wrench className="h-4 w-4" />
          さらにツールを追加
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setCount(4)}>
          リセット
        </Button>
        <span className="text-sm text-[var(--color-muted)]">
          混乱度{" "}
          <strong className="tabular text-[var(--color-danger)]">{confusion}%</strong>
        </span>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {visible.map((t) => (
          <li
            key={t.name}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] px-3 py-3"
          >
            <p className="font-mono text-sm font-medium">{t.name}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{t.role}</p>
          </li>
        ))}
      </ul>

      {count >= TOOLS.length && (
        <p className="mt-4 text-sm text-[var(--color-warn)]">
          すべて揃っても「どれが正解か」は週替わり。新ツールは旧ツールの苦痛を広告にして生まれる。
        </p>
      )}
    </section>
  );
}
