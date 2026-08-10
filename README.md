# Python 受苦博物館

Python がいかに非生産的で、人間を苦しめ、AI を無駄にし、世界の敵であるかを展示するインタラクティブ博物館。

## 展示

- **インデント罠** — 空白がセマンティクスであることの破壊実験
- **書く快感 vs 運用税** — 快感スライダーと10年コスト曲線
- **依存地獄** — install 名 ≠ import 名
- **AI 浪費シミュレータ** — ログだけ渡すとトンチンカン
- **専用ツール群** — 増え続けるパッケージマネージャ
- **告発の確定** — 四つの罪状
- **来館者掲示板** — ログイン後に書き込み

## 累積カウンタ（DB）

来館・操作を Postgres（Neon / プレビュー時は PGLite）に記録し、数字は減らない一方通行で悪化します。

## 技術

- React 19 / TypeScript / Vite 8
- TanStack Start + Router
- Tailwind CSS v4
- Better Auth（Google / X）
- Neon Postgres + PGLite フォールバック

## 開発

```bash
npm install
npm run dev      # http://0.0.0.0:8080
npm run typecheck
npm run build
```

## ライセンス

MIT（風刺・批判展示。敬意と告発は両立する。）
