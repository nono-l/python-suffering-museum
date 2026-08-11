# Python 受苦博物館

Python がいかに非生産的で、人間を苦しめ、AI を無駄にし、世界の敵であるかを展示するインタラクティブ博物館。

## 展示

- **インデント罠** — 空白がセマンティクスであることの破壊実験
- **書く快感 vs 運用税** — 快感スライダーと10年コスト曲線
- **依存地獄** — install 名 ≠ import 名
- **AI 浪費シミュレータ** — ログだけ渡すとトンチンカン
- **専用ツール群** — 増え続けるパッケージマネージャ
- **可変デフォルト引数** — `def f(x=[])` の共有 list 罠
- **GIL** — 並列性の虚偽広告
- **告発の確定** — 14 件の罪状
- **来館者掲示板** — ログイン後に書き込み

## 累積カウンタ（DB）

来館・操作を Postgres（Neon / ローカルは PGLite）に記録し、数字は減らない一方通行で悪化します。

## 技術

- React 19 / TypeScript / Vite 8
- TanStack Start + Router
- Tailwind CSS v4
- Better Auth（Google / X）
- Neon Postgres + PGLite フォールバック
- Vercel（Nitro `vercel` preset）

## セットアップ（クリーンインストール）

Node.js **22+** を推奨。ロックファイルは `npm ci` 前提で同期済みです。

```bash
git clone https://github.com/nono-l/python-suffering-museum.git
cd python-suffering-museum
npm ci
cp .env.example .env   # 必要なら編集
npm run dev            # http://0.0.0.0:8080
```

```bash
npm run typecheck
npm run build          # → .vercel/output （Vercel 向け）
```

## 公開デプロイ（Vercel）

1. このリポジトリを Vercel に Import
2. Framework: Vite / Nitro の自動検出で問題ない想定（ビルドは `npm run build`）
3. 環境変数（`.env.example` 参照）:
   - `DATABASE_URL` — Neon など本番 Postgres（未設定時は PGLite フォールバック）
   - `VITE_PUBLIC_HOSTNAME` — 公開ホスト名（例: `xxx.vercel.app`）→ OG / X カード画像 URL に使用
   - `BETTER_AUTH_SECRET` — 本番用ランダム文字列
   - OAuth 用 `GOOGLE_*` / `TWITTER_*`（任意）
4. デプロイ後、共有カードが効くか [opengraph.xyz](https://www.opengraph.xyz/) などで `https://あなたのホスト/og.jpg` を確認

## ライセンス

MIT（風刺・批判展示。敬意と告発は両立する。）
