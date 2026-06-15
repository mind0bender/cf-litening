import { LANGUAGES, type RunnerResult } from "@mind0bender/code-runner";
import { useEffect, useState, useRef, ChangeEvent, JSX } from "react";

interface ExecutionPayload {
  lang: LANGUAGES;
  code: string;
  stdins: string[];
}

type ExecutionResult = RunnerResult;

export default function App() {
  const [payload, setPayload] = useState<ExecutionPayload>({
    lang: "js",
    code: "",
    stdins: [""],
  });
  const [results, setResults] = useState<ExecutionResult[]>([]);

  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect((): (() => void) => {
    const ws = new WebSocket(`ws://localhost:3000`);
    socketRef.current = ws;

    ws.onopen = (): void => {
      setConnected(true);
    };

    ws.onmessage = (event: MessageEvent<string>): void => {
      const data: ExecutionResult[] = JSON.parse(event.data);
      setResults(data);
    };

    ws.onclose = (): void => {
      setConnected(false);
    };

    return (): void => ws.close();
  }, []);

  const handleSendDirect = (): void => {
    if (socketRef.current && payload.code.trim() !== "") {
      socketRef.current.send(JSON.stringify(payload));
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif", maxWidth: "400px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            fontSize: "12px",
            color: connected ? "green" : "red",
            background: connected ? "#e6f4ea" : "#fce8e6",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          {connected ? "Connected" : "Offline"}
        </span>
      </div>

      <div>
        <textarea
          value={payload.code}
          rows={20}
          cols={40}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>): void =>
            setPayload(
              (p: ExecutionPayload): ExecutionPayload => ({
                ...p,
                code: e.target.value,
              }),
            )
          }
          placeholder="Write your code here"
          style={{ flexGrow: 1, padding: "6px" }}
          disabled={!connected}
        />
        <button onClick={handleSendDirect} disabled={!connected}>
          Run
        </button>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          height: "200px",
          overflowY: "auto",
          marginBottom: "12px",
          padding: "8px",
        }}
      >
        {results.map((result: ExecutionResult, index: number): JSX.Element => {
          if (result.verdict !== "SUCCESS") {
            return (
              <div key={index} style={{ color: "red", fontStyle: "italic", fontSize: "13px" }}>
                {result.stderr}
              </div>
            );
          }
          return (
            <div key={index} style={{ margin: "6px 0" }}>
              <div
                style={{
                  background: "#0070f3",
                  color: "white",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  display: "inline-block",
                }}
              >
                {result.stdout}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
