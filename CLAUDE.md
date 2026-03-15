# kaoawase - リアルタイムクイズ大会アプリ

## 起動
```
npm run dev  # http://localhost:3000
```

## 画面
- **ユーザー**: http://localhost:3000
- **管理者**: http://localhost:3000/admin

## クイズ問題の編集
`data/questions.ts` を編集する

## DBリセット
`db/quiz.db` を削除して `npm run dev` で再起動

## フォルダ構成
```
app/
  page.tsx          # ユーザー画面（名前登録→クイズ→完了）
  admin/page.tsx    # 管理者画面（得票数・ランキング）
  api/
    register/       # POST: 名前登録
    questions/      # GET: 問題取得
    answer/         # POST: 回答送信・採点
    stream/         # GET: SSEストリーム（管理者向け）
data/
  questions.ts      # クイズ問題定義
lib/
  db.ts             # SQLite接続・クエリ
types/
  index.ts          # 共通型定義
db/
  quiz.db           # SQLiteファイル（自動生成）
```

## 技術スタック
- Next.js 14 (App Router, TypeScript)
- SQLite (better-sqlite3)
- TailwindCSS
- Server-Sent Events (SSE) でリアルタイム更新
