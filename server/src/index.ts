import { Runner, compilers, type LANGUAGES, type RunnerResult } from "@mind0bender/code-runner";
import { type ServerWebSocket } from "bun";

const PORT: string = process.env.PORT || "3000";

interface ExecutionInput {
  stdin: string;
  id: string;
}

interface ExecutionPayload {
  lang: LANGUAGES;
  code: string;
  stdins: ExecutionInput[];
}

type ExecutionResult = {
  inputId: string;
  result: RunnerResult;
};

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
      try {
        const data: ExecutionPayload = JSON.parse(message);
        const { lang, code, stdins } = data;

        if (!Object.hasOwn(compilers, lang)) {
          ws.send(
            JSON.stringify({
              inputId: "-1",
              result: {
                verdict: "SYSTEM_ERROR",
                stdout: "",
                stderr: `Compiler for language '${lang}' not found`,
                exitCode: 404,
                executionTimeMs: -1,
              },
            }),
          );
          return;
        }

        const executionPromises = stdins.map(async (input: ExecutionInput): Promise<void> => {
          if (ws.readyState !== 1) return;

          try {
            const runnerRes: RunnerResult = await Runner.run(compilers[lang], code, {
              stdin: input.stdin,
              timeoutMs: 5000,
            });

            const data: ExecutionResult = {
              result: runnerRes,
              inputId: input.id,
            };

            if (ws.readyState === 1) {
              ws.send(JSON.stringify(data as ExecutionResult));
            }
          } catch (error) {
            if (ws.readyState === 1) {
              ws.send(
                JSON.stringify({
                  inputId: input.id,
                  result: {
                    verdict: "SYSTEM_ERROR",
                    stdout: "",
                    stderr: error instanceof Error ? error.message : "Execution failed",
                    exitCode: 500,
                    executionTimeMs: -1,
                  },
                } satisfies ExecutionResult),
              );
            }
          }
        });

        await Promise.all(executionPromises);
      } catch (parseError) {
        console.error("Malformed message payload received:", parseError);
        ws.send(
          JSON.stringify({
            verdict: "SYSTEM_ERROR",
            stdout: "",
            stderr: "Invalid JSON format payload.",
            exitCode: 400,
            executionTimeMs: -1,
          }),
        );
      }
    },
    close(ws: ServerWebSocket): void {
      console.log(`Removed connection for ID: ${ws.remoteAddress}`);
    },
  },
});

console.log(`Socket router running on ws://localhost:${server.port}`);
