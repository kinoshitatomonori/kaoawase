import { NextResponse } from "next/server";
import { QUESTIONS } from "@/data/questions";
import type { QuestionForClient } from "@/types";

export async function GET() {
  const questions: QuestionForClient[] = QUESTIONS.map(({ correctIndex: _, ...rest }) => rest);

  return NextResponse.json(questions);
}
