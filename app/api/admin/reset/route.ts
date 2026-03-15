import { NextResponse } from "next/server";
import { resetAll, buildStreamData } from "@/lib/db";
import { broadcast } from "@/lib/sse";

export async function POST() {
  resetAll();
  broadcast(buildStreamData());
  return NextResponse.json({ ok: true });
}
