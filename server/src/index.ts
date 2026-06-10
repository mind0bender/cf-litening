const PORT: string = process.env.PORT || "3000";
const server = Bun.serve({
  port: PORT,
  fetch(req: Request): Response {
    if (req.method === "POST") {
      const url: URL = new URL(req.url);
      const code: string = url.searchParams.get("code") || "";

      const stream: ReadableStream<Uint8Array> = new ReadableStream({
        start(controller: Bun.ReadableStreamController<Uint8Array>) {
          const encoder: TextEncoder = new TextEncoder();
          controller.enqueue(encoder.encode("started"));

          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }
    return new Response("Not Found", { status: 404 });
  },
});

