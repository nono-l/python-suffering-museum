import { useMemo, useState } from "react";
import { AlertTriangle, Bomb, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

type Mode = "trap" | "safe";

type CallLog = {
  id: number;
  arg: string;
  returned: string[];
  note: string;
};

/**
 * Simulates Python's mutable default evaluation:
 * default object is created once at "function definition" time.
 */
function makeTrapFn() {
  // Shared forever — like Python's def f(x, lst=[]):
  const shared: string[] = [];
  return (item: string) => {
    shared.push(item);
    return [...shared];
  };
}

function makeSafeFn() {
  // lst=None; if lst is None: lst = []
  return (item: string, lst?: string[]) => {
    const bag = lst ?? [];
    bag.push(item);
    return [...bag];
  };
}

const SAMPLE_TRAP = `def append_item(item, lst=[]):   # 定義時に list が1回だけ生成
    lst.append(item)
    return lst

append_item("a")  # ['a']
append_item("b")  # ['a', 'b']  ← 別呼び出しなのに共有
append_item("c")  # ['a', 'b', 'c']`;

const SAMPLE_SAFE = `def append_item(item, lst=None):
    if lst is None:
        lst = []                  # 呼び出しごとに新しい list
    lst.append(item)
    return lst

append_item("a")  # ['a']
append_item("b")  # ['b']        ← 独立
append_item("c")  # ['c']`;

export function MutableDefault() {
  const [mode, setMode] = useState<Mode>("trap");
  const [fnVersion, setFnVersion] = useState(0);
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [seq, setSeq] = useState(0);

  const trapFn = useMemo(() => makeTrapFn(), [fnVersion]);
  const safeFn = useMemo(() => makeSafeFn(), [fnVersion]);

  const items = ["a", "b", "c", "d", "e", "f"];
  const nextItem = items[logs.length % items.length] ?? "x";

  function callOnce() {
    const item = nextItem;
    let returned: string[];
    let note: string;
    if (mode === "trap") {
      returned = trapFn(item);
      note =
        logs.length === 0
          ? "初回。共有 list に積まれた。"
          : "別呼び出しなのに、前の呼び出しの list が残っている。";
    } else {
      returned = safeFn(item);
      note = "None 経由で毎回新しい list。共有されない。";
    }
    setSeq((s) => s + 1);
    setLogs((prev) => [
      ...prev,
      { id: seq + 1, arg: item, returned, note },
    ]);
    void recordMuseumEvent("interaction");
  }

  function redefine() {
    setFnVersion((v) => v + 1);
    setLogs([]);
    setSeq(0);
    void recordMuseumEvent("interaction");
  }

  function switchMode(next: Mode) {
    setMode(next);
    setFnVersion((v) => v + 1);
    setLogs([]);
    setSeq(0);
  }

  const sharedLen = mode === "trap" && logs.length > 0
    ? logs[logs.length - 1]!.returned.length
    : 0;

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
            EXHIBIT 06
          </p>
          <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
            可変デフォルト引数 — 定義時に一度だけ
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
            「書くのが短い」ために、デフォルト値が関数定義時に一度だけ評価される。
            その結果、list / dict が呼び出しをまたいで共有され、見た目と意味が乖離する。
            熟練者ですら踏み抜く、言語仕様のフットガン。
          </p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-danger-dim)] bg-[var(--color-danger-dim)] px-3 py-2 text-right">
          <p className="text-xs text-[var(--color-muted)]">共有 list の長さ</p>
          <p className="font-display text-2xl font-semibold tabular text-[var(--color-danger)]">
            {mode === "trap" ? sharedLen : "—"}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "trap" ? "danger" : "outline"}
          onClick={() => switchMode("trap")}
        >
          <Bomb className="h-4 w-4" />
          罠モード def f(x=[])
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "safe" ? "secondary" : "outline"}
          onClick={() => switchMode("safe")}
        >
          <Shield className="h-4 w-4" />
          安全モード lst=None
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--color-subtle)]">
            {mode === "trap" ? "問題のコード" : "定石の回避"}
          </p>
          <pre className="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] p-4 font-mono text-[11px] leading-relaxed text-[var(--color-muted)] sm:text-xs">
            {mode === "trap" ? SAMPLE_TRAP : SAMPLE_SAFE}
          </pre>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={callOnce}>
              append_item("{nextItem}") を呼ぶ
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={redefine}>
              <RefreshCw className="h-4 w-4" />
              関数を再定義（共有を捨てる）
            </Button>
          </div>
        </div>

        <div className="flex flex-col rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-4">
          <p className="mb-3 text-xs font-medium text-[var(--color-subtle)]">
            呼び出しログ（戻り値）
          </p>
          {logs.length === 0 ? (
            <p className="flex-1 text-sm text-[var(--color-muted)]">
              「呼ぶ」を押すたびに、Python が返す list をここに積みます。
              罠モードでは、別呼び出しなのに中身が残ります。
            </p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto">
              {logs.map((row) => (
                <li
                  key={row.id}
                  className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-mono-bg)] px-3 py-2"
                >
                  <p className="font-mono text-xs text-[var(--color-fg)]">
                    #{row.id} append_item("{row.arg}") → [
                    {row.returned.map((x) => `'${x}'`).join(", ")}]
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--color-muted)]">{row.note}</p>
                </li>
              ))}
            </ul>
          )}

          {mode === "trap" && logs.length >= 2 && (
            <div className="mt-3 flex gap-2 border-t border-[var(--color-border)] pt-3 text-sm text-[var(--color-muted)]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-warn)]" />
              <p>
                戻り値が「蓄積」している。各呼び出しは独立したつもりでも、
                デフォルト list は<strong className="text-[var(--color-fg)]">定義時のオブジェクト1個</strong>
                を指し続けている。書く瞬間は短い。壊れる瞬間は本番。
              </p>
            </div>
          )}
          {mode === "safe" && logs.length >= 2 && (
            <div className="mt-3 border-t border-[var(--color-border)] pt-3 text-sm text-[var(--color-muted)]">
              毎回独立した list。冗長さ（None チェック）と引き換えに、共有バグは消える。
              Python は「短い書き方」をデフォルトにし、安全な書き方を定石として人間に押し付ける。
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
