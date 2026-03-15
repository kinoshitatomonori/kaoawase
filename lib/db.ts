import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { QUESTIONS } from "@/data/questions";
import type { StreamData } from "@/types";

// Railway では DB_PATH 環境変数で /data/quiz.db を指定してください
// ローカルでは db/quiz.db を使います
const DB_PATH =
  process.env.DB_PATH ?? path.join(process.cwd(), "db", "quiz.db");

// DBファイルのディレクトリが存在しない場合は作成
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS participants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      score INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id TEXT NOT NULL,
      question_id INTEGER NOT NULL,
      selected_index INTEGER NOT NULL,
      is_correct INTEGER NOT NULL,
      answered_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

// 参加者登録
export function createParticipant(id: string, name: string) {
  getDb()
    .prepare("INSERT INTO participants (id, name) VALUES (?, ?)")
    .run(id, name);
}

// 回答を保存してスコア更新 → 新スコアを返す
export function saveAnswer(
  participantId: string,
  questionId: number,
  selectedIndex: number,
  isCorrect: boolean,
  point: number
): number {
  const db = getDb();
  db.prepare(
    "INSERT INTO answers (participant_id, question_id, selected_index, is_correct) VALUES (?, ?, ?, ?)"
  ).run(participantId, questionId, selectedIndex, isCorrect ? 1 : 0);

  if (isCorrect) {
    db.prepare("UPDATE participants SET score = score + ? WHERE id = ?").run(
      point,
      participantId
    );
  }

  const row = db
    .prepare("SELECT score FROM participants WHERE id = ?")
    .get(participantId) as { score: number } | undefined;
  return row?.score ?? 0;
}

// 問題ごとの選択肢別得票数（1クエリで全問取得）
export function getVoteCounts(): { questionId: number; counts: number[] }[] {
  const rows = getDb()
    .prepare(
      `SELECT question_id, selected_index, COUNT(*) as cnt
       FROM answers
       GROUP BY question_id, selected_index`
    )
    .all() as { question_id: number; selected_index: number; cnt: number }[];

  const map = new Map<number, number[]>();
  for (const q of QUESTIONS) map.set(q.id, [0, 0, 0, 0]);

  for (const row of rows) {
    const counts = map.get(row.question_id);
    if (counts && row.selected_index >= 0 && row.selected_index <= 3) {
      counts[row.selected_index] = row.cnt;
    }
  }

  return Array.from(map.entries()).map(([questionId, counts]) => ({
    questionId,
    counts,
  }));
}

// 全データリセット（トランザクション）
export function resetAll() {
  const db = getDb();
  db.transaction(() => {
    db.prepare("DELETE FROM answers").run();
    db.prepare("DELETE FROM participants").run();
  })();
}

// 上位3名
export function getLeaderboard(): { name: string; score: number }[] {
  return getDb()
    .prepare(
      "SELECT name, score FROM participants ORDER BY score DESC, created_at ASC LIMIT 3"
    )
    .all() as { name: string; score: number }[];
}

// SSE配信用データ構築（3箇所で重複していたロジックを集約）
export function buildStreamData(): StreamData {
  return {
    votes: getVoteCounts(),
    leaderboard: getLeaderboard().map((entry, i) => ({
      rank: i + 1,
      name: entry.name,
      score: entry.score,
    })),
  };
}
