import { NextResponse } from "next/server";
import { QUESTIONS } from "@/data/questions";
import type { QuestionForClient } from "@/types";

export async function GET() {
  const questions: QuestionForClient[] = QUESTIONS.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options,
    point: q.point,
    image: q.image,
  }));

  return NextResponse.json(questions);
}
