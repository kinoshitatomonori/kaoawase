"use client";

import { useState } from "react";
import Image from "next/image";
import type { QuestionForClient, AnswerResponse } from "@/types";

type Phase = "register" | "quiz" | "done";

const OPTION_LABELS = ["A", "B", "C"];

export default function Home() {
  const [phase, setPhase] = useState<Phase>("register");
  const [name, setName] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [questions, setQuestions] = useState<QuestionForClient[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  async function handleRegister() {
    if (!name.trim()) {
      setError("名前を入力してください");
      return;
    }
    setLoading(true);
    setError("");

    const [regRes, qRes] = await Promise.all([
      fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      }),
      fetch("/api/questions"),
    ]);

    if (!regRes.ok) {
      const data = await regRes.json();
      setError(data.error);
      setLoading(false);
      return;
    }

    const [regData, qs] = await Promise.all([
      regRes.json(),
      qRes.json() as Promise<QuestionForClient[]>,
    ]);

    setParticipantId(regData.participantId);
    setQuestions(qs);
    setLoading(false);
    setPhase("quiz");
  }

  async function handleSubmit() {
    if (selected === null) return;
    setLoading(true);

    const res = await fetch("/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        participantId,
        questionId: questions[currentIndex].id,
        selectedIndex: selected,
      }),
    });
    const data: AnswerResponse = await res.json();
    setResult(data);
    setLoading(false);
  }

  const isLastQuestion = currentIndex + 1 >= questions.length;

  function handleNext() {
    if (isLastQuestion) {
      setFinalScore(result?.currentScore ?? 0);
      setPhase("done");
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setResult(null);
    }
  }

  const currentQ = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-pink-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* 登録画面 */}
        {phase === "register" && (
          <div className="fade-in backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-10 text-center space-y-6">
            <div className="space-y-2">
              <p className="text-pink-300 text-sm font-semibold tracking-widest uppercase">Welcome</p>
              <h1 className="text-4xl font-bold text-white">クイズ大会</h1>
              <p className="text-white/60 text-sm">名前を入力して参加してください</p>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              placeholder="あなたの名前"
              className="w-full bg-white/10 border border-white/30 rounded-2xl px-5 py-4 text-white placeholder-white/40 text-lg focus:outline-none focus:border-pink-400 focus:bg-white/15 transition"
              maxLength={20}
            />
            {error && <p className="text-pink-300 text-sm">{error}</p>}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white font-bold py-4 rounded-2xl text-lg transition shadow-lg shadow-pink-500/30 disabled:opacity-50"
            >
              {loading ? "参加中..." : "参加する →"}
            </button>
          </div>
        )}

        {/* クイズ画面 */}
        {phase === "quiz" && currentQ && (
          <div className="fade-in space-y-4">
            {/* ヘッダー情報 */}
            <div className="flex justify-between items-center text-white/70 text-sm px-1">
              <span className="font-medium">{name} さん</span>
              <span className="bg-white/10 border border-white/20 rounded-full px-3 py-1">
                {currentIndex + 1} <span className="text-white/40">/</span> {questions.length}
              </span>
            </div>

            {/* プログレスバー */}
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-pink-400 to-violet-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* 問題カード */}
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-7 space-y-5">
              {currentQ.image && (
                <div className="rounded-2xl overflow-hidden">
                  <Image
                    src={currentQ.image}
                    alt={`問題${currentIndex + 1}の画像`}
                    width={480}
                    height={270}
                    className="w-full object-cover"
                  />
                </div>
              )}

              <h2 className="text-xl font-bold text-white leading-relaxed">{currentQ.text}</h2>

              {/* 選択肢 */}
              <div className="space-y-3">
                {currentQ.options.map((opt, i) => {
                  let cls = "w-full text-left px-5 py-4 rounded-2xl border font-medium transition-all ";

                  if (result) {
                    if (i === result.correctIndex) {
                      cls += "border-emerald-400 bg-emerald-400/20 text-emerald-200";
                    } else if (i === selected && !result.correct) {
                      cls += "border-rose-400 bg-rose-400/20 text-rose-300";
                    } else {
                      cls += "border-white/10 bg-white/5 text-white/30";
                    }
                  } else if (selected === i) {
                    cls += "border-pink-400 bg-pink-400/20 text-white";
                  } else {
                    cls += "border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/10";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => !result && setSelected(i)}
                      disabled={!!result}
                      className={cls}
                    >
                      <span className="inline-block w-7 text-pink-300 font-bold mr-2">
                        {OPTION_LABELS[i]}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* 正誤フィードバック */}
              {result && (
                <div className={`fade-in text-center py-3 rounded-2xl font-bold text-lg ${
                  result.correct
                    ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                    : "bg-rose-400/20 text-rose-300 border border-rose-400/30"
                }`}>
                  {result.correct ? "✓ 正解！" : "✗ 不正解..."}
                </div>
              )}

              {/* アクションボタン */}
              {!result ? (
                <button
                  onClick={handleSubmit}
                  disabled={selected === null || loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-400 hover:to-violet-400 text-white font-bold py-4 rounded-2xl text-lg transition shadow-lg shadow-pink-500/30 disabled:opacity-30 disabled:shadow-none"
                >
                  {loading ? "送信中..." : "回答する"}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold py-4 rounded-2xl text-lg transition"
                >
                  {isLastQuestion ? "結果を見る →" : "次の問題 →"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 完了画面 */}
        {phase === "done" && (
          <div className="fade-in backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-10 text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white">お疲れ様でした！</h1>
              <p className="text-white/60 text-sm">{name} さんの結果</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl py-8">
              <p className="text-white/50 text-sm mb-2">あなたの得点</p>
              <p className="text-6xl font-bold text-white">
                {finalScore}
                <span className="text-2xl ml-2 text-pink-300">点</span>
              </p>
            </div>
            <p className="text-white/40 text-sm">管理者画面でランキングをご確認ください</p>
          </div>
        )}

      </div>
    </div>
  );
}
