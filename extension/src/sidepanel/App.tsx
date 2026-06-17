import Button from "@/components/Button";
import StopWatch from "@/components/StopWatch";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { LANGUAGES, type RunnerResult } from "@mind0bender/code-runner";
import { Editor } from "@monaco-editor/react";
import { ChevronDown, Zap } from "lucide-react";
import { useEffect, useCallback, useState, useRef, type JSX } from "react";

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

const LanguageMap: Record<LANGUAGES, string> = {
  c: "C",
  cpp: "C++",
  js: "Javascript",
  ts: "Typescript",
  rust: "Rust",
  python: "Python",
  java: "Java",
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

  const payloadRef = useRef<ExecutionPayload>(payload);
  useEffect((): void => {
    payloadRef.current = payload;
  }, [payload]);

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
      console.log("result", data);
    };
    ws.onclose = (): void => {
      setConnected(false);
    };
    return (): void => ws.close();
  }, []);

  // FIX: Read directly from payloadRef so this function reference never changes
  const handleSendDirect = useCallback((): void => {
    const currentPayload = payloadRef.current;
    console.log(currentPayload);
    if (socketRef.current && currentPayload.code.trim() !== "") {
      socketRef.current.send(JSON.stringify(currentPayload));
      console.log("sending to server");
    }
  }, []);

  const handleEditorDidMount = (editor: any, monaco: any): void => {
    editor.addAction({
      id: "submit-code",
      label: "Submit Code",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: (): void => {
        handleSendDirect();
      },
    });
  };

  return (
    <div className="bg-stone-950 w-full min-h-screen px-2 py-2 flex flex-col gap-2">
      <div className="grid grid-cols-3">
        <StopWatch />
        <div className="flex justify-center items-center text-stone-200">
          <Listbox
            value={payload.lang}
            onChange={(newLang: LANGUAGES): void =>
              setPayload(
                (pP: ExecutionPayload): ExecutionPayload => ({
                  ...pP,
                  lang: newLang,
                }),
              )
            }
          >
            <div className="relative z-10">
              <ListboxButton className={"outline-none"}>
                <Button className="text-stone-200 relative justify-between w-full min-w-30 flex items-center shadow-md outline-none cursor-pointer bg-stone-900 border-stone-700 text-base">
                  {LanguageMap[payload.lang]}
                  <ChevronDown />
                </Button>
              </ListboxButton>
              <ListboxOptions className="mt-1 absolute max-height-60 w-full overflow-auto rounded-md bg-stone-900 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm border border-stone-700">
                {Object.keys(LanguageMap).map(
                  (langKey: string): JSX.Element => (
                    <ListboxOption
                      key={langKey}
                      value={langKey}
                      className="relative cursor-pointer select-none py-2 px-4 text-stone-200 data-focus:bg-stone-600 data-focus:text-stone-50 transition-colors"
                    >
                      {LanguageMap[langKey as LANGUAGES]}
                    </ListboxOption>
                  ),
                )}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>
        <div className="flex items-center justify-end gap-2">
          <span
            title={connected ? "connected to server" : "not connected"}
            className={`p-1 w-fit rounded-full ${connected ? "bg-emerald-400" : "bg-red-500"}`}
          />
          <Button
            title="Run"
            className="group/btn p-1 bg-stone-800 border border-stone-700 rounded-full cursor-pointer hover:border-yellow-600"
            onClick={handleSendDirect}
          >
            <Zap
              className="fill-stone-400 stroke-0 group-hover/btn:fill-yellow-400 transition-colors"
              size={16}
            />
          </Button>
        </div>
      </div>
      <Editor
        className="rounded-md overflow-hidden"
        value={payload.code}
        height="50vh"
        language="cpp"
        theme="vs-dark"
        onMount={handleEditorDidMount}
        onChange={(value: string | undefined): void =>
          setPayload(
            (p: ExecutionPayload): ExecutionPayload => ({
              ...p,
              code: value || "",
            }),
          )
        }
        options={{
          automaticLayout: true,
          lineNumbersMinChars: 2,
          lineDecorationsWidth: 0,
          glyphMargin: false,
        }}
      />
      <div className="flex gap-1">
        {payload.stdins.map((execInp: ExecutionInput, idx: number): JSX.Element => {
          return (
            <div
              key={execInp.id}
              onClick={() => setActiveTC(execInp.id)}
              className={`font-semibold text-base px-2 py-0.5 rounded-sm cursor-pointer hover:ring ring-stone-700 hover:text-stone-300 duration-200 ${activeTC === execInp.id ? "bg-stone-700 text-stone-300 font-semibold" : "text-stone-400"}`}
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
          <div className="whitespace-pre flex flex-col gap-4">
            <div className="text-stone-200">
              <div className="text-base font-semibold">Input</div>
              <div>{activeTCInput || " "}</div>
            </div>
            <div className="text-stone-200">
              <div className="text-base font-semibold">Output</div>
              <div>{activeTCResult?.stdout}</div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
