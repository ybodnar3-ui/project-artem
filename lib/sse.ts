/** Server-Sent Events helpers. Each message is a single JSON payload with a
 *  `type` discriminator, read on the client via a fetch() stream reader. */

export type SseMessage =
  | { type: "status"; stage: string; label: string }
  | { type: "done"; slug: string }
  | { type: "error"; code: string; message: string };

export function sseChunk(message: SseMessage): string {
  return `data: ${JSON.stringify(message)}\n\n`;
}

export const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  // Disable proxy buffering (nginx / some CDNs) so events flush immediately.
  "X-Accel-Buffering": "no",
} as const;
