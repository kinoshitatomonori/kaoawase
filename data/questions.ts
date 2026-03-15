export type Question = {
  id: number;
  text: string;
  options: string[];
  correctIndex: number; // 0〜3
  point: number;
  image?: string; // 画像パス (例: "/images/q1.jpg") — 省略可
};

// ここを編集してクイズ問題を変更してください
// image フィールドを追加すると問題文の上に画像が表示されます
// 画像は public/images/ フォルダに置いてください
export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "日本の首都はどこ？",
    options: ["大阪", "東京", "京都", "名古屋"],
    correctIndex: 1,
    point: 10,
    // image: "/images/q1.jpg",
  },
  {
    id: 2,
    text: "世界で一番大きい大陸は？",
    options: ["アフリカ", "北アメリカ", "ユーラシア", "南アメリカ"],
    correctIndex: 2,
    point: 10,
  },
  {
    id: 3,
    text: "水の化学式は？",
    options: ["CO2", "NaCl", "H2O", "O2"],
    correctIndex: 2,
    point: 10,
  },
  {
    id: 4,
    text: "1 + 1 = ?",
    options: ["1", "2", "3", "4"],
    correctIndex: 1,
    point: 10,
  },
  {
    id: 5,
    text: "富士山の高さは？",
    options: ["3,776m", "3,500m", "4,000m", "3,200m"],
    correctIndex: 0,
    point: 10,
  },
  {
    id: 6,
    text: "太陽系で一番大きい惑星は？",
    options: ["土星", "木星", "天王星", "海王星"],
    correctIndex: 1,
    point: 10,
  },
  {
    id: 7,
    text: "オリンピックの輪は何色ある？",
    options: ["4", "5", "6", "7"],
    correctIndex: 1,
    point: 10,
  },
  {
    id: 8,
    text: "日本の国旗の色の組み合わせは？",
    options: ["青と白", "赤と金", "赤と白", "緑と白"],
    correctIndex: 2,
    point: 10,
  },
  {
    id: 9,
    text: "1年は何日？",
    options: ["364日", "365日", "366日", "360日"],
    correctIndex: 1,
    point: 10,
  },
  {
    id: 10,
    text: "人間の体で一番大きい臓器は？",
    options: ["心臓", "肝臓", "皮膚", "肺"],
    correctIndex: 2,
    point: 10,
  },
];
