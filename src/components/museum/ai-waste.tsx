import { useState } from "react";
import { Bot, FileCode2, ShieldBan, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

const SAMPLE_LOG = `Traceback (most recent call last):
  File "app.py", line 42, in <module>
    main()
  File "app.py", line 38, in main
    result = pipeline.run(cfg)
  File "site-packages/obscure_lib/pipeline.py", line 219, in run
    return self._steps[-1](ctx)
  File "site-packages/obscure_lib/steps.py", line 88, in __call__
    data = transform(data, **self.opts)
TypeError: 'NoneType' object is not subscriptable`;

type Phase = "idle" | "log-only" | "with-source" | "restricted";

const RESPONSES: Record<Exclude<Phase, "idle">, string> = {
  "log-only":
    "AI: おそらくネットワークの問題です。ファイアウォールを確認し、pip install --upgrade pip を実行してください。必要なら Docker を再起動すると直ることがあります。\n\n（ログにネットワークの痕跡はない。典型的なトンチンカン。）",
  "with-source":
    "AI: transform が None を返すので、opts を全部 Optional にして try/except で握りつぶしましょう。ついでに global を追加し、再帰で再試行するパッチを当てます…\n\n[patch applied]\nwhile True:\n    try:\n        return transform(data)\n    except Exception:\n        pass  # 無限ループでさらに壊す\n\n（修復行為が新たな破壊を生んだ。）",
  restricted:
    "AI: このリクエストは安全上の制限に到達したため処理できません。別のモデルにフォールバックします…\n\n→ フォールバック先も同じログでは原因を特定できず、堂々巡りが確定。\n制限に行った時点で、無駄なループに入っていた証拠。",
};

export function AiWaste() {
  const [log, setLog] = useState(SAMPLE_LOG);
  const [phase, setPhase] = useState<Phase>("idle");
  const [tokens, setTokens] = useState(0);

  function run(next: Exclude<Phase, "idle">) {
    setPhase(next);
    setTokens((t) => t + (next === "log-only" ? 1400 : next === "with-source" ? 6200 : 9800));
    void recordMuseumEvent("ai");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
        EXHIBIT 04
      </p>
      <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
        AI 浪費シミュレータ
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
        ログを見てもどこが壊れたかわからない。ソースを渡しても無限ループでさらに壊す。
        最先端モデルに投げても制限に吸い込まれ、知能そのものが無駄になる。
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-[var(--color-subtle)]">
            <Terminal className="h-4 w-4" />
            エラーログ（観測窓）
          </div>
          <textarea
            value={log}
            onChange={(e) => setLog(e.target.value)}
            spellCheck={false}
            className="min-h-48 w-full resize-y rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-3 font-mono text-[11px] leading-relaxed text-[var(--color-muted)] outline-none sm:text-xs"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => run("log-only")}>
              <Bot className="h-4 w-4" />
              ログだけ AI に渡す
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => run("with-source")}>
              <FileCode2 className="h-4 w-4" />
              ソースも渡して直させる
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={() => run("restricted")}>
              <ShieldBan className="h-4 w-4" />
              最上位モデルへ
            </Button>
          </div>
        </div>

        <div className="flex flex-col rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-[var(--color-subtle)]">AI 出力</span>
            <span className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs tabular text-[var(--color-warn)]">
              浪費トークン {tokens.toLocaleString("ja-JP")}
            </span>
          </div>
          <pre className="flex-1 whitespace-pre-wrap font-mono text-xs leading-relaxed text-[var(--color-fg)]">
            {phase === "idle"
              ? "ボタンを押すと、Python の失敗モードがいかに外部知能を空転させるかを再現します。"
              : RESPONSES[phase]}
          </pre>
          {phase !== "idle" && (
            <p className="mt-4 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-muted)]">
              原因は AI の性能不足だけではない。失敗状態が解釈・修復可能な形で露出していない。
              言語が知能を浪費する装置になっている。
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
