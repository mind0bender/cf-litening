import { Runner, compilers, type LANGUAGES, type RunnerResult } from "@mind0bender/code-runner";
import { ServerWebSocket } from "bun";

const PORT: string = process.env.PORT || "3000";

// interface UserSocket {
//   socketId: string;
// }
//
// const server = Bun.serve({
//   port: PORT,
//   routes: {
//     "/run/:lang": (req: Bun.BunRequest<"/:lang">): Response => {
//       console.log(`${req.method} method at ${new URL(req.url).pathname}`);
//       const { lang } = req.params as { lang: LANGUAGES };
//
//       if (req.method === "GET") {
//         const url: URL = new URL(req.url);
//         const code: string = url.searchParams.get("code") || "";
//         const stdins: string[] = url.searchParams.getAll("stdin");
//         if (!stdins.length) stdins.push("");
//
//         console.log(code);
//         console.log(stdins);
//
//         if (!lang || !code) {
//           return new Response("Bad Request: lang and code must be specified", {
//             status: 400,
//           });
//         }
//
//         if (!Object.hasOwn(compilers, lang)) {
//           return new Response("Bad Request: Unsupported language", {
//             status: 400,
//           });
//         }
//
//         const stream: ReadableStream<Uint8Array> = new ReadableStream({
//           async start(controller: Bun.ReadableStreamController<Uint8Array>): Promise<void> {
//             const encoder: TextEncoder = new TextEncoder();
//             controller.enqueue(encoder.encode("started\n\n"));
//             console.log("Starting...");
//
//             for (let stdin of stdins) {
//               const result = await Runner.run(compilers[lang], code, {
//                 stdin,
//               });
//               const output = result.stdout.replace(/\n/g, "\ndata: ");
//               controller.enqueue(encoder.encode(`${output}\n\n`));
//               console.log(`Output for stdin "${stdin}":\n${output}`);
//             }
//
//             controller.enqueue(encoder.encode("ending\n\n"));
//             console.log("ending...");
//
//             controller.close();
//           },
//         });
//         return new Response(stream, {
//           headers: {
//             "Content-Type": "text/event-stream",
//             "Cache-Control": "no-cache",
//             Connection: "keep-alive",
//           },
//         });
//       }
//
//       return Response.json({ lang });
//     },
//   },
//   websocket: {
//     data: {} as UserSocket,
//     open(ws: Bun.ServerWebSocket<UserSocket>): void {
//       console.log(`\tclient++\t:\t${ws.data.socketId}\tjoined`);
//     },
//     message(ws: Bun.ServerWebSocket<UserSocket>, message: string): void {
//       console.log(`received a message from ${ws.data.socketId}\n${message}`);
//     },
//     close(ws: Bun.ServerWebSocket<UserSocket>, code: number, reason: string): void {
//       console.log(`\tclient--\t:\t${ws.data.socketId}\tleft`);
//     },
//   },
// });

interface ExecutionPayload {
  lang: LANGUAGES;
  code: string;
  stdins: string[];
}

type ExecutionResult = RunnerResult;
const server = Bun.serve({
  port: PORT,
  fetch(req: Request, server: Bun.Server<undefined>): Response | undefined {
    const upgraded = server.upgrade(req);
    if (upgraded) return undefined;

    return new Response("Upgrade failed", { status: 400 });
  },
  websocket: {
    open(ws: ServerWebSocket): void {
      console.log(`Registered connection from ${ws.remoteAddress}`);
    },
    async message(ws: ServerWebSocket, message: string): Promise<void> {
      const data: ExecutionPayload = JSON.parse(message);
      const { lang, code, stdins } = data;

      console.table({
        lang,
        code,
        stdins: JSON.stringify(stdins),
      });

      if (!Object.hasOwn(compilers, lang)) {
        ws.send(
          JSON.stringify({
            verdict: "SYSTEM_ERROR",
            stdout: "",
            stderr: "Compiler not found",
            exitCode: 404,
            executionTimeMs: -1,
          } satisfies ExecutionResult),
        );
      }

      console.log("Starting...");

      for (let stdin of stdins) {
        const result: RunnerResult = await Runner.run(compilers[lang], code, {
          stdin,
        });
        ws.send(JSON.stringify(result));
        console.log(`sending ${JSON.stringify(result)}`);
      }

      console.log("ending...");
    },
    close(ws: ServerWebSocket): void {
      console.log(`Removed connection for ID: ${ws.remoteAddress}`);
    },
  },
});

console.log(`P2P Socket router running on ws://localhost:${server.port}`);

// http://localhost:3000/run/cpp?code=%23include%20%3Ciostream%3E%0A%23include%20%3Cvector%3E%0A%23include%20%3Cnumeric%3E%0A%0Avoid%20solve()%20%7B%0A%20%20%20%20int%20n%3B%0A%20%20%20%20std%3A%3Acin%20%3E%3E%20n%3B%20%2F%2F%20Read%20the%20size%20of%20the%20array%20for%20this%20test%20case%0A%20%20%20%20%0A%20%20%20%20std%3A%3Avector%3Clong%20long%3E%20vec(n)%3B%20%2F%2F%20Using%20long%20long%20to%20prevent%20integer%20overflow%0A%20%20%20%20for%20(int%20i%20%3D%200%3B%20i%20%3C%20n%3B%20i%2B%2B)%20%7B%0A%20%20%20%20%20%20%20%20std%3A%3Acin%20%3E%3E%20vec%5Bi%5D%3B%0A%20%20%20%20%7D%0A%20%20%20%20%0A%20%20%20%20%2F%2F%20Sum%20the%20array%20elements%20starting%20from%200LL%20(long%20long%20zero)%0A%20%20%20%20long%20long%20sum%20%3D%20std%3A%3Aaccumulate(vec.begin()%2C%20vec.end()%2C%200LL)%3B%0A%20%20%20%20%0A%20%20%20%20std%3A%3Acout%20%3C%3C%20sum%20%3C%3C%20%22%5Cn%22%3B%20%2F%2F%20Output%20the%20result%20followed%20by%20a%20newline%0A%7D%0A%0Aint%20main()%20%7B%0A%20%20%20%20%2F%2F%20Fast%20I%2FO%20for%20competitive%20programming%0A%20%20%20%20std%3A%3Aios_base%3A%3Async_with_stdio(false)%3B%0A%20%20%20%20std%3A%3Acin.tie(NULL)%3B%0A%20%20%20%20%0A%20%20%20%20int%20t%3B%0A%20%20%20%20std%3A%3Acin%20%3E%3E%20t%3B%20%2F%2F%20Read%20the%20total%20number%20of%20test%20cases%0A%20%20%20%20%0A%20%20%20%20while%20(t--)%20%7B%0A%20%20%20%20%20%20%20%20solve()%3B%20%2F%2F%20Process%20each%20test%20case%0A%20%20%20%20%7D%0A%20%20%20%20%0A%20%20%20%20return%200%3B%0A%7D%0A
