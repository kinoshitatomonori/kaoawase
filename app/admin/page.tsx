"use client";

import { useEffect, useState } from "react";
import type { StreamData, VoteData, LeaderboardEntry, QuestionForClient } from "@/types";

const OPTION_LABELS = ["A", "B", "C", "D"];
const OPTION_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
];
const MEDALS = ["🥇", "🥈", "🥉"];

export default function AdminPage() {
  const [data, setData] = useState<StreamData | null>(null);
  const [questions, setQuestions] = useState<QuestionForClient[]>([]);
  const [connected, setConnected] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    if (!confirm("全参加者データと回答をリセットしますか？\nこの操作は取り消せません。")) return;
    setResetting(true);
    await fetch("/api/admin/reset", { method: "POST" });
    setResetting(false);
  }

  useEffect(() => {
    fetch("/api/questions")
      .then((r) => r.json())
      .then(setQuestions);
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/stream");
    es.onopen = () => setConnected(true);
    es.onmessage = (e) => {
      setData(JSON.parse(e.data) as StreamData);
    };
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">管理者画面</h1>
          <div className="flex items-center gap-3">
            <span
              className={`text-sm px-3 py-1 rounded-full font-medium ${
                connected
                  ? "bg-green-800 text-green-300"
                  : "bg-red-800 text-red-300"
              }`}
            >
              {connected ? "● リアルタイム接続中" : "● 切断"}
            </span>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="text-sm px-4 py-1.5 rounded-full font-medium bg-red-700 hover:bg-red-600 text-white transition disabled:opacity-50"
            >
              {resetting ? "リセット中..." : "データリセット"}
            </button>
          </div>
        </div>

        {/* ランキング */}
        <section className="bg-gray-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-yellow-400">上位3名</h2>
          {!data || data.leaderboard.length === 0 ? (
            <p className="text-gray-400">まだ回答がありません</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {data.leaderboard.map((entry) => (
                <RankCard key={entry.rank} entry={entry} />
              ))}
            </div>
          )}
        </section>

        {/* 各問題の得票数 */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white">問題別 得票数</h2>
          {questions.length === 0 && (
            <p className="text-gray-400">問題を読み込み中...</p>
          )}
          {questions.map((q) => {
            const vote = data?.votes.find((v) => v.questionId === q.id);
            return (
              <VoteCard key={q.id} question={q} vote={vote} />
            );
          })}
        </section>
      </div>
    </div>
  );
}

function RankCard({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="bg-gray-700 rounded-xl p-4 text-center space-y-1">
      <div className="text-3xl">{MEDALS[entry.rank - 1]}</div>
      <div className="font-bold text-lg text-white truncate">{entry.name}</div>
      <div className="text-yellow-400 font-bold text-xl">{entry.score}点</div>
    </div>
  );
}

function VoteCard({
  question,
  vote,
}: {
  question: QuestionForClient;
  vote?: VoteData;
}) {
  const counts = vote?.counts ?? [0, 0, 0, 0];
  const total = counts.reduce((s, c) => s + c, 0);
  const maxCount = Math.max(...counts, 1);

  return (
    <div className="bg-gray-800 rounded-2xl p-5 space-y-3">
      <div className="flex justify-between text-sm text-gray-400">
        <span>問題 {question.id}</span>
        <span>合計 {total} 票</span>
      </div>
      <p className="font-semibold text-white">{question.text}</p>
      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const pct = total > 0 ? Math.round((counts[i] / total) * 100) : 0;
          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm text-gray-300">
                <span>
                  <span className="font-bold text-gray-400 mr-1">
                    {OPTION_LABELS[i]}.
                  </span>
                  {opt}
                </span>
                <span className="font-bold">
                  {counts[i]}票 ({pct}%)
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className={`${OPTION_COLORS[i]} h-4 rounded-full transition-all duration-500`}
                  style={{ width: `${(counts[i] / maxCount) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
