import { NextResponse } from "next/server";
import { addClient, removeClient, encodeSSE } from "@/lib/sse";
import { buildStreamData } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      addClient(controller);
      // 接続直後に現在のデータを送信
      controller.enqueue(encodeSSE(buildStreamData()));
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
