import type { StreamData } from "@/types";

// アクティブなSSEクライアントのコントローラーセット
// Next.js の dev モードではホットリロードで再初期化されるため global に持つ
declare global {
  // eslint-disable-next-line no-var
  var _sseClients:
    | Set<ReadableStreamDefaultController<Uint8Array>>
    | undefined;
}

function getClients(): Set<ReadableStreamDefaultController<Uint8Array>> {
  if (!global._sseClients) {
    global._sseClients = new Set();
  }
  return global._sseClients;
}

export function addClient(
  controller: ReadableStreamDefaultController<Uint8Array>
) {
  getClients().add(controller);
}

export function removeClient(
  controller: ReadableStreamDefaultController<Uint8Array>
) {
  getClients().delete(controller);
}

const encoder = new TextEncoder();

export function encodeSSE(data: StreamData): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
}

export function broadcast(data: StreamData) {
  const encoded = encodeSSE(data);
  const dead: ReadableStreamDefaultController<Uint8Array>[] = [];

  for (const controller of getClients()) {
    try {
      controller.enqueue(encoded);
    } catch {
      dead.push(controller);
    }
  }

  for (const c of dead) {
    getClients().delete(c);
  }
}
