export type Question = {
  id: number;
  text: string;
  options: string[];
  correctIndex: number; // 0〜2
  point: number;
  image?: string; // 画像パス (例: "/images/q1.jpg") — 省略可
  explanation?: string; // 正誤発表後に表示する解説文 — 省略可
};

// ここを編集してクイズ問題を変更してください
// image フィールドを追加すると問題文の上に画像が表示されます
// 画像は public/images/ フォルダに置いてください
export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "あさみの中学時代の部活動は？",
    options: ["水泳", "剣道", "バレーボール"],
    correctIndex: 1,
    point: 10,
    // image: "/images/q1.jpg",
    explanation: "あさみは中学時代、剣道部に所属していました。"
  },
  {
    id: 2,
    text: "あさみの推し大阪ブルテオンの本拠地は？",
    options: ["ブルテオンスタジアム", "おおきにアリーナ", "パナソニックアリーナ"],
    correctIndex: 2,
    point: 10,
  },
  {
    id: 3,
    text: "あさみの持っている資格は？",
    options: ["チョコレートエキスパート", "チョコレートスペシャリスト", "チョコレートマイスター"],
    correctIndex: 1,
    point: 10,
  },
  {
    id: 4,
    text: "とものりが経験したことがないものは？",
    options: ["野球", "ピアノ", "囲碁"],
    correctIndex: 0,
    point: 10,
  },
  {
    id: 5,
    text: "とものりの好きなハイキューの名言は？",
    options: ["AAA", "BBB", "CCC"],
    correctIndex: 0,
    point: 10,
  },
  {
    id: 6,
    text: "とものりの一番好きな芸人は？",
    options: ["男性ブランコ", "令和ロマン", "真空ジェシカ"],
    correctIndex: 2,
    point: 10,
  },
  {
    id: 7,
    text: "二人で行った海外の数は？",
    options: ["3", "4", "5"],
    correctIndex: 1,
    point: 10,
  },
  {
    id: 8,
    text: "あさみはとものりをなんと呼んでいる？",
    options: ["のっくん", "とーくん", "のりちゃん"],
    correctIndex: 0,
    point: 10,
  },
  {
    id: 9,
    text: "プロポーズをした場所は？",
    options: ["京都", "長崎", "沖縄"],
    correctIndex: 1,
    point: 10,
  },
  {
    id: 10,
    text: "あさみの手料理でとものりが一番好きなものは？",
    options: ["ハンバーグ", "オムライス", "キーマカレー"],
    correctIndex: 2,
    point: 10,
  },
];
