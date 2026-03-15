# kaoawase - リアルタイムクイズ大会アプリ

## 現在の状態
実装完了・Railway本番稼働中。GitHubへのpushで自動デプロイされる。
GitHubリポジトリ: https://github.com/kinoshitatomonori/kaoawase

---

## 起動
```
npm run dev  # http://localhost:3000
```

## 画面
- **ユーザー**: http://localhost:3000
- **管理者**: http://localhost:3000/admin

---

## よくある作業

### クイズ問題を変更したい
→ `data/questions.ts` を編集して `git push`

### デプロイしたい
→ `git push`（Railway自動デプロイ）

### DBをリセットしたい
→ 管理者画面の「データリセット」ボタン、またはローカルは `db/quiz.db` を削除して再起動

---

## 重要ファイル一覧

| ファイル | 役割 |
|---------|------|
| `data/questions.ts` | クイズ問題定義。問題変更はここを編集する |
| `types/index.ts` | 共通型定義。`QuestionForClient = Omit<Question, "correctIndex">` |
| `lib/db.ts` | SQLite接続・`buildStreamData()`・`resetAll()` |
| `lib/sse.ts` | SSEクライアント管理・`broadcast()`・`encodeSSE()` |
| `app/page.tsx` | ユーザー画面（登録→クイズ→完了） |
| `app/admin/page.tsx` | 管理者画面（得票バーグラフ・ランキング） |
| `app/api/questions/route.ts` | `correctIndex`のみ除外して全フィールドを返す |
| `app/api/answer/route.ts` | 回答採点・スコア更新・SSEブロードキャスト |
| `app/api/stream/route.ts` | SSEストリーム（管理者画面が購読） |
| `app/api/admin/reset/route.ts` | 全データリセット |
| `nixpacks.toml` | Railway用。Node 20 + Python3（better-sqlite3のビルドに必須） |

---

## 問題定義の型（data/questions.ts）

```ts
export type Question = {
  id: number;
  text: string;
  options: string[];      // 3択
  correctIndex: number;   // 0〜2
  point: number;
  image?: string;         // 省略可。画像は public/images/ に置く
  explanation?: string;   // 省略可。正誤発表後に表示される解説文
};
```

---

## UIデザイン方針
- **ユーザー画面**: ベージュ基調のシックなデザイン（amber/stone系カラー）
- **管理者画面**: ウォームダーク（stone-900/amber-950）
- グラスモーフィズム: `backdrop-blur-md bg-white/80 border border-amber-200/60`
- フェードアニメーション: `.fade-in`（`app/globals.css`で定義）

---

## 技術スタック
- Next.js 14 (App Router, TypeScript)、`src/` なしのフラット構成
- SQLite (`better-sqlite3`)。`DB_PATH` env varで切替（Railway: `/data/quiz.db`、ローカル: `db/quiz.db`）
- TailwindCSS v4
- SSE（Server-Sent Events）でリアルタイム更新

## Railwayの設定
- Volume を `/data` にマウント済み
- 環境変数 `DB_PATH=/data/quiz.db` を設定済み
