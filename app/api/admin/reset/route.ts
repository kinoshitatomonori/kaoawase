import { NextResponse } from "next/server";
import { resetAll, getVoteCounts, getLeaderboard } from "@/lib/db";
import { broadcast } from "@/lib/sse";
import { QUESTIONS } from "@/data/questions";

export async function POST() {
  resetAll();

  // リセット後の空データをSSEで配信
  broadcast({
    votes: getVoteCounts(QUESTIONS.length),
    leaderboard: getLeaderboard().map((e, i) => ({
      rank: i + 1,
      name: e.name,
      score: e.score,
    })),
  });

  return NextResponse.json({ ok: true });
}
