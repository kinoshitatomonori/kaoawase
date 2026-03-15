"use client";

import { useEffect, useState } from "react";
import type { StreamData, VoteData, LeaderboardEntry, QuestionForClient } from "@/types";

const OPTION_LABELS = ["A", "B", "C"];
const OPTION_COLORS = [
  "from-amber-500 to-amber-400",
  "from-stone-500 to-stone-400",
  "from-orange-500 to-orange-400",
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
    es.onmessage = (e) => setData(JSON.parse(e.data) as StreamData);
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-amber-950 to-stone-800 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ヘッダー */}
        <div className="fade-in flex items-center justify-between">
          <div>
            <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-1">Dashboard</p>
            <h1 className="text-3xl font-bold text-white">管理者画面</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium border ${
              connected
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}>
              {connected ? "● LIVE" : "● 切断"}
            </span>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="text-sm px-4 py-1.5 rounded-full font-medium bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 transition disabled:opacity-50"
            >
              {resetting ? "リセット中..." : "データリセット"}
            </button>
          </div>
        </div>

        {/* ランキング */}
        <section className="fade-in backdrop-blur-md bg-amber-50/5 border border-amber-200/10 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <h2 className="text-lg font-bold text-white">ランキング Top 3</h2>
          </div>
          {!data || data.leaderboard.length === 0 ? (
            <p className="text-white/30 text-sm">まだ回答がありません</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {data.leaderboard.map((entry) => (
                <RankCard key={entry.rank} entry={entry} />
              ))}
            </div>
          )}
        </section>

        {/* 問題別得票数 */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white fade-in">問題別 得票数</h2>
          {questions.length === 0 && (
            <p className="text-white/30 text-sm">読み込み中...</p>
          )}
          {questions.map((q) => (
            <VoteCard
              key={q.id}
              question={q}
              vote={data?.votes.find((v) => v.questionId === q.id)}
            />
          ))}
        </section>

      </div>
    </div>
  );
}

function RankCard({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div className="backdrop-blur-md bg-amber-50/5 border border-amber-200/10 rounded-2xl p-5 text-center space-y-2">
      <div className="text-3xl">{MEDALS[entry.rank - 1]}</div>
      <div className="font-bold text-white truncate">{entry.name}</div>
      <div className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-stone-300 bg-clip-text text-transparent">
        {entry.score}<span className="text-sm ml-0.5">点</span>
      </div>
    </div>
  );
}

function VoteCard({ question, vote }: { question: QuestionForClient; vote?: VoteData }) {
  const counts = vote?.counts ?? [0, 0, 0];
  const total = counts.reduce((s, c) => s + c, 0);
  const maxCount = Math.max(...counts, 1);

  return (
    <div className="fade-in backdrop-blur-md bg-amber-50/5 border border-amber-200/10 rounded-2xl p-5 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-xs text-amber-400 font-semibold">Q{question.id}</span>
          <p className="font-semibold text-white">{question.text}</p>
        </div>
        <span className="text-xs bg-white/10 border border-white/10 rounded-full px-3 py-1 text-white/50 whitespace-nowrap ml-4">
          {total} 票
        </span>
      </div>
      <div className="space-y-2.5">
        {question.options.map((opt, i) => {
          const pct = total > 0 ? Math.round((counts[i] / total) * 100) : 0;
          return (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">
                  <span className="font-bold text-white/40 mr-1.5">{OPTION_LABELS[i]}.</span>
                  {opt}
                </span>
                <span className="text-white/50 font-medium">{counts[i]}票 ({pct}%)</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-3">
                <div
                  className={`bg-gradient-to-r ${OPTION_COLORS[i]} h-3 rounded-full transition-all duration-700`}
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
