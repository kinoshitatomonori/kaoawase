import { NextRequest, NextResponse } from "next/server";
import { QUESTIONS } from "@/data/questions";
import { saveAnswer, buildStreamData } from "@/lib/db";
import { broadcast } from "@/lib/sse";
import type { AnswerRequest, AnswerResponse } from "@/types";

export async function POST(req: NextRequest) {
  const body: AnswerRequest = await req.json();
  const { participantId, questionId, selectedIndex } = body;

  if (!participantId || questionId == null || selectedIndex == null) {
    return NextResponse.json({ error: "パラメータが不足しています" }, { status: 400 });
  }

  const question = QUESTIONS.find((q) => q.id === questionId);
  if (!question) {
    return NextResponse.json({ error: "問題が見つかりません" }, { status: 404 });
  }

  const isCorrect = selectedIndex === question.correctIndex;
  const currentScore = saveAnswer(participantId, questionId, selectedIndex, isCorrect, question.point);

  broadcast(buildStreamData());

  return NextResponse.json<AnswerResponse>({
    correct: isCorrect,
    correctIndex: question.correctIndex,
    currentScore,
  });
}
