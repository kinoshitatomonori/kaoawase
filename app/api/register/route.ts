import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { createParticipant } from "@/lib/db";
import type { RegisterResponse } from "@/types";

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "名前を入力してください" }, { status: 400 });
  }

  const participantId = uuidv4();
  createParticipant(participantId, name.trim());

  return NextResponse.json<RegisterResponse>({ participantId });
}
