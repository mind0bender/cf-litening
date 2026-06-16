import { LANGUAGES, type RunnerResult } from "@mind0bender/code-runner";
import { Editor } from "@monaco-editor/react";
import { useEffect, useState, useRef, type JSX } from "react";
import RunIcon from "./assets/run.svg";

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

export default function App(): JSX.Element {
  const [payload, setPayload] = useState<ExecutionPayload>(
    (): ExecutionPayload => ({
      lang: "cpp",
      code: "",
      stdins: [],
    }),
  );

  const [activeTC, setActiveTC] = useState<string>("");

  const [results, setResults] = useState<Map<string, RunnerResult>>(
    new Map<string, RunnerResult>(),
  );

  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const handleAddTestCase = (testcase: string): void => {
    const tcId: string = crypto.randomUUID();
    setPayload(
      (prev: ExecutionPayload): ExecutionPayload => ({
        ...prev,
        stdins: [
          ...prev.stdins,
          {
            stdin: testcase,
            id: tcId,
          },
        ],
      }),
    );
    setActiveTC(tcId);
  };

  useEffect((): void => {
    handleAddTestCase("5\n1 2 3 4 5");
  }, []);

  useEffect((): (() => void) => {
    const ws = new WebSocket(`ws://localhost:3000`);
    socketRef.current = ws;

    ws.onopen = (): void => {
      setConnected(true);
    };

    ws.onmessage = (event: MessageEvent<string>): void => {
      const data: ExecutionResult = JSON.parse(event.data);
      setResults((pR: Map<string, RunnerResult>): Map<string, RunnerResult> => {
        const newMap: Map<string, RunnerResult> = new Map<string, RunnerResult>(pR);
        newMap.set(data.inputId, data.result);
        return newMap;
      });
      console.log("adding", data);
    };

    ws.onclose = (): void => {
      setConnected(false);
    };

    return (): void => ws.close();
  }, []);

  const handleSendDirect = (): void => {
    if (socketRef.current && payload.code.trim() !== "") {
      socketRef.current.send(JSON.stringify(payload));
      console.log("sending to server");
    }
  };

  return (
    <div className="bg-stone-950 w-full min-h-screen px-2 py-2 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span
          title={connected ? "connected to server" : "not connected"}
          className={`p-1 w-fit rounded-full ${connected ? "bg-emerald-400" : "bg-red-500"}`}
        />
        <button
          className="bg-stone-700 px-2 py-1 font-semibold text-stone-50 rounded-xs cursor-pointer"
          onClick={handleSendDirect}
          disabled={!connected}
        >
          <img className="w-3.5 text-stone-400" src={RunIcon} />
        </button>
      </div>

      <div>
        <Editor
          value={payload.code}
          height="50vh"
          language="cpp"
          theme="vs-dark"
          onChange={(value: string | undefined): void =>
            setPayload(
              (p: ExecutionPayload): ExecutionPayload => ({
                ...p,
                code: value || "",
              }),
            )
          }
          options={{ automaticLayout: true }}
        />
      </div>

      <div className="flex gap-2">
        {payload.stdins.map((execInp: ExecutionInput, idx: number): JSX.Element => {
          return (
            <div
              onClick={() => setActiveTC(execInp.id)}
              className={`font-emibold text-base px-1.5 rounded-sm cursor-pointer hover:bg-stone-700 hover:text-stone-300 duration-200 ${activeTC === execInp.id ? "bg-stone-700 text-stone-300" : "text-stone-400"}`}
            >
              Case {idx + 1}
            </div>
          );
        })}
      </div>
      {((): JSX.Element => {
        const activeTCInput: string =
          payload.stdins.find((execInp: ExecutionInput): boolean => execInp.id === activeTC)
            ?.stdin || " ";
        const activeTCResult: RunnerResult | undefined = results.get(activeTC);
        return (
          <div className="whitespace-pre">
            <div className="text-stone-200">
              <div>Input</div>
              <div>{activeTCInput || " "}</div>
            </div>
            <div className="text-stone-200">
              <div>Output</div>
              <div>{activeTCResult?.stdout}</div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
