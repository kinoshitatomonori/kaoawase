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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* 登録画面 */}
        {phase === "register" && (
          <div className="fade-in backdrop-blur-md bg-white/80 border border-amber-200/60 rounded-3xl shadow-xl p-10 text-center space-y-6">
            <div className="space-y-2">
              <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase">Welcome</p>
              <h1 className="text-4xl font-bold text-stone-800">クイズ大会</h1>
              <p className="text-stone-400 text-sm">名前を入力して参加してください</p>
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-stone-600 text-left space-y-2 mt-2">
              <p>🎁 <span className="font-semibold text-stone-700">上位2名には景品が用意されているかも</span></p>
              <p>🔒 皆さんの回答内容は他の方からは見えません</p>
            </div>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              placeholder="あなたの名前"
              className="w-full bg-white/60 border border-amber-300 rounded-2xl px-5 py-4 text-stone-800 placeholder-stone-400 text-lg focus:outline-none focus:border-amber-500 focus:bg-white/80 transition"
              maxLength={20}
            />
            {error && <p className="text-rose-500 text-sm">{error}</p>}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 to-stone-600 hover:from-amber-500 hover:to-stone-500 text-white font-bold py-4 rounded-2xl text-lg transition shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? "参加中..." : "参加する →"}
            </button>
          </div>
        )}

        {/* クイズ画面 */}
        {phase === "quiz" && currentQ && (
          <div className="fade-in space-y-4">
            {/* ヘッダー情報 */}
            <div className="flex justify-between items-center text-stone-500 text-sm px-1">
              <span className="font-medium">{name} さん</span>
              <span className="bg-amber-100/80 border border-amber-200 rounded-full px-3 py-1 text-stone-500">
                {currentIndex + 1} <span className="text-stone-400">/</span> {questions.length}
              </span>
            </div>

            {/* プログレスバー */}
            <div className="w-full bg-stone-200 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-amber-400 to-stone-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* 問題カード */}
            <div className="backdrop-blur-md bg-white/80 border border-amber-200/60 rounded-3xl shadow-xl p-7 space-y-5">
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

              <h2 className="text-xl font-bold text-stone-800 leading-relaxed">{currentQ.text}</h2>

              {/* 選択肢 */}
              <div className="space-y-3">
                {currentQ.options.map((opt, i) => {
                  let cls = "w-full text-left px-5 py-4 rounded-2xl border font-medium transition-all ";

                  if (result) {
                    if (i === result.correctIndex) {
                      cls += "border-emerald-400 bg-emerald-50 text-emerald-700";
                    } else if (i === selected && !result.correct) {
                      cls += "border-rose-400 bg-rose-50 text-rose-600";
                    } else {
                      cls += "border-stone-200 bg-stone-50 text-stone-400";
                    }
                  } else if (selected === i) {
                    cls += "border-amber-500 bg-amber-50 text-stone-800";
                  } else {
                    cls += "border-stone-200 bg-white/60 text-stone-700 hover:border-amber-400 hover:bg-amber-50/50";
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => !result && setSelected(i)}
                      disabled={!!result}
                      className={cls}
                    >
                      <span className="inline-block w-7 text-amber-600 font-bold mr-2">
                        {OPTION_LABELS[i]}.
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* 正誤フィードバック */}
              {result && (
                <div className="fade-in space-y-3">
                  <div className={`text-center py-3 rounded-2xl font-bold text-lg ${
                    result.correct
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                      : "bg-rose-50 text-rose-600 border border-rose-300"
                  }`}>
                    {result.correct ? "✓ 正解！" : "✗ 不正解..."}
                  </div>
                  {/* 解説は一時非表示
                  {currentQ.explanation && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-2xl px-5 py-4 text-sm text-stone-600 leading-relaxed">
                      <span className="text-amber-700 font-semibold mr-2">解説</span>
                      {currentQ.explanation}
                    </div>
                  )}
                  */}
                </div>
              )}

              {/* アクションボタン */}
              {!result ? (
                <button
                  onClick={handleSubmit}
                  disabled={selected === null || loading}
                  className="w-full bg-gradient-to-r from-amber-600 to-stone-600 hover:from-amber-500 hover:to-stone-500 text-white font-bold py-4 rounded-2xl text-lg transition shadow-lg shadow-amber-500/20 disabled:opacity-30 disabled:shadow-none"
                >
                  {loading ? "送信中..." : "回答する"}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="w-full bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 font-bold py-4 rounded-2xl text-lg transition"
                >
                  {isLastQuestion ? "結果を見る →" : "次の問題 →"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 完了画面 */}
        {phase === "done" && (
          <div className="fade-in backdrop-blur-md bg-white/80 border border-amber-200/60 rounded-3xl shadow-xl p-10 text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-stone-800">お疲れ様でした！</h1>
              <p className="text-stone-400 text-sm">{name} さんの結果</p>
            </div>
            <div className="bg-amber-50 border border-amber-200/60 rounded-2xl py-8">
              <p className="text-stone-400 text-sm mb-2">あなたの得点</p>
              <p className="text-6xl font-bold text-stone-800">
                {finalScore}
                <span className="text-2xl ml-2 text-amber-600">点</span>
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
