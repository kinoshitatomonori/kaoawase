"use client";

import { useState } from "react";
import Image from "next/image";
import type { QuestionForClient, AnswerResponse } from "@/types";

type Phase = "register" | "quiz" | "done";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">

        {/* 登録画面 */}
        {phase === "register" && (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold text-indigo-700">クイズ大会</h1>
            <p className="text-gray-500">名前を入力して参加してください</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              placeholder="あなたの名前"
              className="w-full border-2 border-indigo-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:border-indigo-500"
              maxLength={20}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-lg transition disabled:opacity-50"
            >
              {loading ? "登録中..." : "参加する"}
            </button>
          </div>
        )}

        {/* クイズ画面 */}
        {phase === "quiz" && currentQ && (
          <div className="space-y-5">
            <div className="flex justify-between text-sm text-gray-400">
              <span>{name} さん</span>
              <span>
                問題 {currentIndex + 1} / {questions.length}
              </span>
            </div>

            {/* プログレスバー */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all"
                style={{
                  width: `${((currentIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            {/* 問題画像 */}
            {currentQ.image && (
              <div className="rounded-xl overflow-hidden">
                <Image
                  src={currentQ.image}
                  alt={`問題${currentIndex + 1}の画像`}
                  width={480}
                  height={270}
                  className="w-full object-cover"
                />
              </div>
            )}

            <h2 className="text-xl font-bold text-gray-800">{currentQ.text}</h2>

            {/* 選択肢 */}
            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((opt, i) => {
                let btnClass =
                  "w-full text-left px-5 py-4 rounded-xl border-2 font-medium text-gray-700 transition ";

                if (result) {
                  if (i === result.correctIndex) {
                    btnClass += "border-green-500 bg-green-50 text-green-700";
                  } else if (i === selected && !result.correct) {
                    btnClass += "border-red-400 bg-red-50 text-red-600";
                  } else {
                    btnClass += "border-gray-200 bg-gray-50 text-gray-400";
                  }
                } else if (selected === i) {
                  btnClass += "border-indigo-500 bg-indigo-50 text-indigo-700";
                } else {
                  btnClass +=
                    "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50";
                }

                return (
                  <button
                    key={i}
                    onClick={() => !result && setSelected(i)}
                    disabled={!!result}
                    className={btnClass}
                  >
                    <span className="inline-block w-6 font-bold text-indigo-400 mr-2">
                      {["A", "B", "C", "D"][i]}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* 正誤フィードバック */}
            {result && (
              <div
                className={`text-center py-3 rounded-xl font-bold text-lg ${
                  result.correct
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {result.correct ? "正解！" : "不正解..."}
              </div>
            )}

            {/* ボタン */}
            {!result ? (
              <button
                onClick={handleSubmit}
                disabled={selected === null || loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-lg transition disabled:opacity-40"
              >
                {loading ? "送信中..." : "回答する"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 rounded-xl text-lg transition"
              >
                {isLastQuestion ? "結果を見る" : "次の問題"}
              </button>
            )}
          </div>
        )}

        {/* 完了画面 */}
        {phase === "done" && (
          <div className="text-center space-y-6">
            <div className="text-6xl">🎉</div>
            <h1 className="text-2xl font-bold text-gray-800">
              お疲れ様でした！
            </h1>
            <p className="text-gray-500">{name} さんの結果</p>
            <div className="bg-indigo-50 rounded-2xl py-8">
              <p className="text-gray-500 text-sm mb-1">あなたの得点</p>
              <p className="text-5xl font-bold text-indigo-700">
                {finalScore}
                <span className="text-xl ml-1 text-indigo-400">点</span>
              </p>
            </div>
            <p className="text-gray-400 text-sm">
              管理者画面でランキングをご確認ください
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
