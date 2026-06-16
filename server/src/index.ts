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
  fetch(req, server) {
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
        // Safe parsing protects the server from crashing on malformed JSON
        const data: ExecutionPayload = JSON.parse(message);
        const { lang, code, stdins } = data;

        console.table({ lang, code, stdins: JSON.stringify(stdins) });

        // Validate compiler existence
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

        console.log(`Starting execution for ${stdins.length} inputs...`);

        const executionPromises = stdins.map(async (input: ExecutionInput): Promise<void> => {
          if (ws.readyState !== 1) return;

          try {
            const runnerRes: RunnerResult = await Runner.run(compilers[lang], code, {
              stdin: input.stdin,
            });

            const data: ExecutionResult = {
              result: runnerRes,
              inputId: input.id,
            };

            if (ws.readyState === 1) {
              ws.send(JSON.stringify(data as ExecutionResult));
              console.log(`Successfully queued frame: ${runnerRes.verdict}`);
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
        console.log("All execution frames processed.");
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

console.log(`P2P Socket router running on ws://localhost:${server.port}`);

// http://localhost:3000/run/cpp?code=%23include%20%3Ciostream%3E%0A%23include%20%3Cvector%3E%0A%23include%20%3Cnumeric%3E%0A%0Avoid%20solve()%20%7B%0A%20%20%20%20int%20n%3B%0A%20%20%20%20std%3A%3Acin%20%3E%3E%20n%3B%20%2F%2F%20Read%20the%20size%20of%20the%20array%20for%20this%20test%20case%0A%20%20%20%20%0A%20%20%20%20std%3A%3Avector%3Clong%20long%3E%20vec(n)%3B%20%2F%2F%20Using%20long%20long%20to%20prevent%20integer%20overflow%0A%20%20%20%20for%20(int%20i%20%3D%200%3B%20i%20%3C%20n%3B%20i%2B%2B)%20%7B%0A%20%20%20%20%20%20%20%20std%3A%3Acin%20%3E%3E%20vec%5Bi%5D%3B%0A%20%20%20%20%7D%0A%20%20%20%20%0A%20%20%20%20%2F%2F%20Sum%20the%20array%20elements%20starting%20from%200LL%20(long%20long%20zero)%0A%20%20%20%20long%20long%20sum%20%3D%20std%3A%3Aaccumulate(vec.begin()%2C%20vec.end()%2C%200LL)%3B%0A%20%20%20%20%0A%20%20%20%20std%3A%3Acout%20%3C%3C%20sum%20%3C%3C%20%22%5Cn%22%3B%20%2F%2F%20Output%20the%20result%20followed%20by%20a%20newline%0A%7D%0A%0Aint%20main()%20%7B%0A%20%20%20%20%2F%2F%20Fast%20I%2FO%20for%20competitive%20programming%0A%20%20%20%20std%3A%3Aios_base%3A%3Async_with_stdio(false)%3B%0A%20%20%20%20std%3A%3Acin.tie(NULL)%3B%0A%20%20%20%20%0A%20%20%20%20int%20t%3B%0A%20%20%20%20std%3A%3Acin%20%3E%3E%20t%3B%20%2F%2F%20Read%20the%20total%20number%20of%20test%20cases%0A%20%20%20%20%0A%20%20%20%20while%20(t--)%20%7B%0A%20%20%20%20%20%20%20%20solve()%3B%20%2F%2F%20Process%20each%20test%20case%0A%20%20%20%20%7D%0A%20%20%20%20%0A%20%20%20%20return%200%3B%0A%7D%0A
