import { useMemo, useState } from "react";
import { GitBranch, Package, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { recordMuseumEvent } from "@/lib/museum-stats";

type Node = {
  id: string;
  install: string;
  importName: string;
  version: string;
  breaks: boolean;
  x: number;
  y: number;
};

const BASE: Omit<Node, "x" | "y">[] = [
  { id: "app", install: "your-app", importName: "app", version: "0.1.0", breaks: false },
  { id: "requests", install: "requests", importName: "requests", version: "2.31", breaks: false },
  { id: "pillow", install: "pillow", importName: "PIL", version: "10.2", breaks: false },
  { id: "cv", install: "opencv-python", importName: "cv2", version: "4.9", breaks: false },
  { id: "yaml", install: "PyYAML", importName: "yaml", version: "6.0", breaks: false },
  { id: "bs4", install: "beautifulsoup4", importName: "bs4", version: "4.12", breaks: false },
  { id: "sklearn", install: "scikit-learn", importName: "sklearn", version: "1.4", breaks: false },
  { id: "attr", install: "attrs", importName: "attr", version: "23.2", breaks: false },
  { id: "proto", install: "protobuf", importName: "google.protobuf", version: "4.25", breaks: true },
  { id: "numpy", install: "numpy", importName: "numpy", version: "1.26", breaks: true },
];

const EDGES: [string, string][] = [
  ["app", "requests"],
  ["app", "pillow"],
  ["app", "cv"],
  ["app", "sklearn"],
  ["requests", "yaml"],
  ["pillow", "numpy"],
  ["cv", "numpy"],
  ["sklearn", "numpy"],
  ["sklearn", "proto"],
  ["bs4", "yaml"],
  ["app", "bs4"],
  ["app", "attr"],
];

function layout(nodes: Omit<Node, "x" | "y">[]): Node[] {
  const cx = 200;
  const cy = 140;
  return nodes.map((n, i) => {
    if (n.id === "app") return { ...n, x: cx, y: cy };
    const angle = ((i - 1) / (nodes.length - 1)) * Math.PI * 2 - Math.PI / 2;
    const r = 95 + (i % 3) * 12;
    return {
      ...n,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r * 0.85,
    };
  });
}

export function DepHell() {
  const [chaos, setChaos] = useState(0);
  const nodes = useMemo(() => {
    const raw = BASE.map((n) => ({
      ...n,
      breaks: n.breaks || chaos >= 2,
      version:
        chaos >= 1 && n.id === "numpy"
          ? "2.0 (破壊的)"
          : chaos >= 2 && n.id === "proto"
            ? "衝突"
            : n.version,
    }));
    return layout(raw);
  }, [chaos]);

  const mismatches = nodes.filter((n) => n.install !== n.importName && n.id !== "app");
  const broken = nodes.filter((n) => n.breaks);

  function pushChaos(level: number) {
    setChaos(level);
    if (level > 0) void recordMuseumEvent("dep");
  }

  return (
    <section className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
      <p className="text-xs font-medium tracking-wide text-[var(--color-danger)]">
        EXHIBIT 03
      </p>
      <h2 className="font-display mt-1 text-xl font-semibold sm:text-2xl">
        依存地獄 — 名前すら嘘
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
        インストール名と import 名が違う。同一ライブラリの複数バージョンは同居できない。
        後方互換を語りながら、解決不能な依存グラフを量産する。
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_260px]">
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-mono-bg)]">
          <svg viewBox="0 0 400 280" className="h-auto w-full" role="img" aria-label="依存グラフ">
            {EDGES.map(([a, b]) => {
              const na = nodes.find((n) => n.id === a);
              const nb = nodes.find((n) => n.id === b);
              if (!na || !nb) return null;
              const hot = na.breaks || nb.breaks;
              return (
                <line
                  key={`${a}-${b}`}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke={hot ? "#f07178" : "#3f3f46"}
                  strokeWidth={hot ? 1.5 : 1}
                  strokeOpacity={0.85}
                />
              );
            })}
            {nodes.map((n) => (
              <g key={n.id}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.id === "app" ? 22 : 16}
                  fill={n.breaks ? "#3b1618" : "#1a1a1e"}
                  stroke={n.breaks ? "#f07178" : "#3f3f46"}
                  strokeWidth={1.5}
                />
                <text
                  x={n.x}
                  y={n.y + 32}
                  textAnchor="middle"
                  fill="#a1a1aa"
                  fontSize="9"
                  fontFamily="ui-monospace, monospace"
                >
                  {n.importName}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="space-y-3">
          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-3">
            <div className="flex items-center gap-2 text-xs text-[var(--color-subtle)]">
              <PackageX className="h-4 w-4" />
              install ≠ import
            </div>
            <p className="mt-2 font-display text-3xl font-semibold tabular">
              {mismatches.length}
            </p>
            <ul className="mt-2 space-y-1 text-xs text-[var(--color-muted)]">
              {mismatches.slice(0, 5).map((n) => (
                <li key={n.id} className="flex justify-between gap-2 font-mono">
                  <span>{n.install}</span>
                  <span className="text-[var(--color-danger)]">→ {n.importName}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-elevated)] p-3">
            <div className="flex items-center gap-2 text-xs text-[var(--color-subtle)]">
              <GitBranch className="h-4 w-4" />
              衝突ノード
            </div>
            <p className="mt-2 font-display text-3xl font-semibold tabular text-[var(--color-danger)]">
              {broken.length}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setChaos(0)}>
              <Package className="h-4 w-4" />
              平穏
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => pushChaos(1)}>
              numpy 2.0
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={() => pushChaos(2)}>
              解決不能
            </Button>
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            {chaos === 0 && "表面的には動いている。名前の嘘は既に仕込まれている。"}
            {chaos === 1 && "主要依存が破壊的アップグレード。下流が連鎖的に赤くなる。"}
            {chaos === 2 &&
              "専用ツールなしでは何もわからない。ツールがあっても狂っている。"}
          </p>
        </div>
      </div>
    </section>
  );
}
