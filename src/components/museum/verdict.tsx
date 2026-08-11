import { useMemo, useState } from "react";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/museum/share-button";

/** Indictment list — maps exhibits + researched design crimes */
const CHARGES = [
  {
    title: "非生産的",
    body: "書く速さの錯覚と引き換えに、観測・修復・依存解決・環境構築の時間を後工程へ転送する。",
    tag: "総論",
  },
  {
    title: "人間を苦しめる",
    body: "空白・可変デフォルト・動的失敗・名前の嘘により、熟練者でさえ再現困難な苦痛を日常化する。",
    tag: "総論",
  },
  {
    title: "AI を無駄にする",
    body: "失敗状態が解釈可能に露出せず、ログとソースを渡してもトンチンカンか無限ループか制限行きになる。",
    tag: "総論",
  },
  {
    title: "世界の敵",
    body: "快感最大化の設計動機が、文明規模の認知資源と計算資源を構造的に浪費する。",
    tag: "総論",
  },
  {
    title: "空白がセマンティクス",
    body: "構造を見えないインデントに預け、フロントエンド・メール・コピー経路がそれを「ゴミ」として破壊する。",
    tag: "EXHIBIT 01",
  },
  {
    title: "可変デフォルトの罠",
    body: "def f(x=[]) は定義時に一度だけ list を作る。呼び出しをまたいで状態が共有され、本番でだけ壊れる。",
    tag: "EXHIBIT 06",
  },
  {
    title: "書く快感の破壊的進化",
    body: "「書いている瞬間の快感」のために後方互換を捨て、意味不明な依存と専用ツールを積み増す。",
    tag: "EXHIBIT 02",
  },
  {
    title: "依存と名前の嘘",
    body: "install 名と import 名が違う。同一ライブラリの複数版は同居できず、解決グラフは常に赤くなる。",
    tag: "EXHIBIT 03",
  },
  {
    title: "ツール乱立による外部化",
    body: "言語が構造を見せない結果、pip / venv / poetry / conda / uv … 理解の窓口がツールに外注され狂う。",
    tag: "EXHIBIT 05",
  },
  {
    title: "並列性の虚偽広告（GIL）",
    body: "スレッドを増やしても CPU バウンドはほぼ1コア。何十年もプロセス分割というワークアラウンドを強要した。",
    tag: "EXHIBIT 07",
  },
  {
    title: "2→3 強制移住",
    body: "後方非互換を一気にやり、業界全体に何年もの移行税を課した。互換を捨てる思想の実証実験。",
    tag: "未展示",
  },
  {
    title: "型は飾りである",
    body: "アノテーションは実行時に無視できる。静的チェックと実行結果が食い違い、IDE も AI も両方外す。",
    tag: "未展示",
  },
  {
    title: "失敗の沈黙",
    body: "EAFP と asyncio のタスク例外が黙って消え、本番と AI の両方に「どこが壊れたか」が届かない。",
    tag: "EXHIBIT 04",
  },
  {
    title: "プロトタイプが本番になる",
    body: "書き始めの速さで採用され、書き換えコストは後年の運用税として請求される。出口のない入口。",
    tag: "構造",
  },
];

export function Verdict() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CHARGES.map((c) => [c.title, true])),
  );

  const score = useMemo(() => {
    const on = Object.values(checked).filter(Boolean).length;
    return Math.round((on / CHARGES.length) * 100);
  }, [checked]);

  const onCount = Object.values(checked).filter(Boolean).length;

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-elevated)] p-5 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            FINAL VERDICT
          </p>
          <h2 className="font-display mt-1 text-2xl font-semibold sm:text-3xl">
            告発の確定
          </h2>
          <p className="mt-2 max-w-xl text-sm text-[var(--color-muted)]">
            展示と設計思想調査に基づく {CHARGES.length} 件の罪状。
            チェックを外して「弁護」してみても、構造は残る。
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-4 py-3 text-right">
          <p className="text-xs text-[var(--color-muted)]">有罪確度</p>
          <p className="font-display text-4xl font-semibold tabular text-[var(--color-danger)]">
            {score}%
          </p>
          <p className="mt-1 text-[10px] tabular text-[var(--color-subtle)]">
            {onCount} / {CHARGES.length} 認定
          </p>
        </div>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {CHARGES.map((c) => (
          <li key={c.title}>
            <label className="flex h-full cursor-pointer gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-border-strong)]">
              <input
                type="checkbox"
                checked={!!checked[c.title]}
                onChange={(e) =>
                  setChecked((prev) => ({ ...prev, [c.title]: e.target.checked }))
                }
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-danger)]"
              />
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <Scale className="h-3.5 w-3.5 shrink-0 text-[var(--color-subtle)]" />
                  <span className="text-sm font-medium leading-snug">{c.title}</span>
                </span>
                <span className="mt-1 block text-[10px] font-medium tracking-wide text-[var(--color-subtle)]">
                  {c.tag}
                </span>
                <span className="mt-1.5 block text-xs leading-relaxed text-[var(--color-muted)] sm:text-sm">
                  {c.body}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-5">
        <Button
          type="button"
          variant="danger"
          onClick={() =>
            setChecked(Object.fromEntries(CHARGES.map((c) => [c.title, true])))
          }
        >
          全罪状を認定
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            setChecked(Object.fromEntries(CHARGES.map((c) => [c.title, false])))
          }
        >
          弁護側の主張（全部外す）
        </Button>
        <ShareButton variant="secondary" label="判決をXでシェア" />
        <p className="w-full text-sm text-[var(--color-muted)] sm:w-auto sm:flex-1">
          {score === 100
            ? "判決: 書くのが楽しいだけのカス言語。ただしその楽しさは、他者の時間と AI の知能を燃料にしている。"
            : score === 0
              ? "弁護は成立したように見える。しかし依存は消えず、空白は意味を持ち続け、デフォルト list は共有され、ログは沈黙する。"
              : `部分的免責（${onCount}/${CHARGES.length}）。残った罪状だけでも、十分に高い文明コストを請求できる。`}
        </p>
      </div>
    </section>
  );
}
