import { NextResponse } from "next/server";
import { addClient, removeClient } from "@/lib/sse";
import { getVoteCounts, getLeaderboard } from "@/lib/db";
import { QUESTIONS } from "@/data/questions";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      addClient(controller);

      // 接続直後に現在のデータを送信
      const votes = getVoteCounts(QUESTIONS.length);
      const rawLeaderboard = getLeaderboard();
      const initialData = {
        votes,
        leaderboard: rawLeaderboard.map((entry, i) => ({
          rank: i + 1,
          name: entry.name,
          score: entry.score,
        })),
      };
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`)
      );
    },
    cancel(controller) {
      removeClient(controller as ReadableStreamDefaultController<Uint8Array>);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
