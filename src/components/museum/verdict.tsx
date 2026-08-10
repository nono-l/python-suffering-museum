import { useMemo, useState } from "react";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareButton } from "@/components/museum/share-button";

const CHARGES = [
  {
    title: "非生産的",
    body: "書く速さの錯覚と引き換えに、観測・修復・依存解決の時間を後工程へ転送する。",
  },
  {
    title: "人間を苦しめる",
    body: "空白・動的失敗・名前の嘘により、熟練者でさえ再現困難な苦痛を日常化する。",
  },
  {
    title: "AI を無駄にする",
    body: "失敗状態が解釈可能に露出せず、高度な知能ほど長い空転と制限行きを強いられる。",
  },
  {
    title: "世界の敵",
    body: "快感最大化の設計動機が、文明規模の認知資源と計算資源を構造的に浪費する。",
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
            展示を通じた四つの罪状。チェックを外して「弁護」してみても、構造は残る。
          </p>
        </div>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-4 py-3 text-right">
          <p className="text-xs text-[var(--color-muted)]">有罪確度</p>
          <p className="font-display text-4xl font-semibold tabular text-[var(--color-danger)]">
            {score}%
          </p>
        </div>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {CHARGES.map((c) => (
          <li key={c.title}>
            <label className="flex cursor-pointer gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-colors hover:border-[var(--color-border-strong)]">
              <input
                type="checkbox"
                checked={!!checked[c.title]}
                onChange={(e) =>
                  setChecked((prev) => ({ ...prev, [c.title]: e.target.checked }))
                }
                className="mt-1 h-4 w-4 accent-[var(--color-danger)]"
              />
              <span>
                <span className="flex items-center gap-2 font-medium">
                  <Scale className="h-4 w-4 text-[var(--color-subtle)]" />
                  {c.title}
                </span>
                <span className="mt-1 block text-sm text-[var(--color-muted)]">{c.body}</span>
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
              ? "弁護は成立したように見える。しかし依存は消えず、空白は意味を持ち続け、ログは沈黙する。"
              : "部分的免責。残った罪状だけでも、十分に高い文明コストを請求できる。"}
        </p>
      </div>
    </section>
  );
}
