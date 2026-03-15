import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

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

// 回答を保存してスコア更新
export function saveAnswer(
  participantId: string,
  questionId: number,
  selectedIndex: number,
  isCorrect: boolean,
  point: number
) {
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
}

// 参加者のスコアを取得
export function getParticipantScore(participantId: string): number {
  const row = getDb()
    .prepare("SELECT score FROM participants WHERE id = ?")
    .get(participantId) as { score: number } | undefined;
  return row?.score ?? 0;
}

// 問題ごとの選択肢別得票数
export function getVoteCounts(
  questionCount: number
): { questionId: number; counts: number[] }[] {
  const db = getDb();
  const results = [];

  for (let qId = 1; qId <= questionCount; qId++) {
    const rows = db
      .prepare(
        "SELECT selected_index, COUNT(*) as cnt FROM answers WHERE question_id = ? GROUP BY selected_index"
      )
      .all(qId) as { selected_index: number; cnt: number }[];

    const counts = [0, 0, 0, 0];
    for (const row of rows) {
      if (row.selected_index >= 0 && row.selected_index <= 3) {
        counts[row.selected_index] = row.cnt;
      }
    }
    results.push({ questionId: qId, counts });
  }

  return results;
}

// 全データリセット
export function resetAll() {
  const db = getDb();
  db.prepare("DELETE FROM answers").run();
  db.prepare("DELETE FROM participants").run();
}

// 上位3名
export function getLeaderboard(): { name: string; score: number }[] {
  return getDb()
    .prepare(
      "SELECT name, score FROM participants ORDER BY score DESC, created_at ASC LIMIT 3"
    )
    .all() as { name: string; score: number }[];
}
