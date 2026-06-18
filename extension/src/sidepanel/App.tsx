import Button from "@/components/Button";
import StopWatch from "@/components/StopWatch";
import { TestCase, TestCasesRequestMessage } from "@/types";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { LANGUAGES, type RunnerResult } from "@mind0bender/code-runner";
import { Editor } from "@monaco-editor/react";
import { ChevronDown, RefreshCcw, Zap } from "lucide-react";
import { useEffect, useCallback, useState, useRef, type JSX, RefObject } from "react";

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
  const payloadRef = useRef<ExecutionPayload>(payload);
  useEffect((): void => {
    payloadRef.current = payload;
  }, [payload]);

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

  const requestTestCasesFromPage = async () => {
    try {
      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!activeTab?.id) {
        console.error("No active tab found");
        return;
      }

      chrome.tabs.sendMessage<TestCasesRequestMessage>(
        activeTab.id,
        { action: "TEST_CASE_REQUEST", payload: undefined },
        (message: TestCasesRequestMessage): void => {
          if (chrome.runtime.lastError) {
            console.error("Error communicating with webpage:", chrome.runtime.lastError.message);
            return;
          }

          const { payload: testCases }: TestCasesRequestMessage = message;
          if (!testCases) return;
          const remainingTCCount: number = 5 - payload.stdins.length;
          (testCases as TestCase[])
            .slice(0, remainingTCCount)
            .forEach((testCase: TestCase): void => {
              handleAddTestCase(testCase);
            });
        },
      );
    } catch (error) {
      console.error("Failed to fetch test cases:", error);
    }
  };

  const firstRequest: RefObject<boolean> = useRef<boolean>(true);
  useEffect((): void => {
    if (firstRequest.current) requestTestCasesFromPage();
    firstRequest.current = false;
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

  const activeTCInput: string =
    payload.stdins.find((execInp: ExecutionInput): boolean => execInp.id === activeTC)?.stdin ||
    " ";
  const activeTCResult: RunnerResult | undefined = results.get(activeTC);

  return (
    <div className="bg-stone-950 w-full min-h-screen px-2 py-2 flex flex-col gap-2">
      <div className="grid grid-cols-3">
        <StopWatch />
        <div className="flex justify-center items-center text-indigo-200">
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
                <div className="px-2 py-1 border border-indigo-200 text-indigo-200 rounded-md hover:bg-indigo-200/10 duration-200 relative justify-between w-full min-w-30 flex items-center shadow-md outline-none cursor-pointer bg-stone-900 text-base">
                  {LanguageMap[payload.lang]}
                  <ChevronDown />
                </div>
              </ListboxButton>
              <ListboxOptions className="mt-1 absolute max-height-60 w-full overflow-auto rounded-md bg-stone-900 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm border border-stone-700">
                {Object.keys(LanguageMap).map(
                  (langKey: string): JSX.Element => (
                    <ListboxOption
                      key={langKey}
                      value={langKey}
                      className="relative cursor-pointer select-none py-2 px-4 text-indigo-200 data-focus:bg-stone-600 data-focus:text-stone-50 transition-colors"
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
      <div className="flex justify-between items-center px-2 py-2 overflow-auto gap-4">
        <div className="flex gap-1">
          {payload.stdins.map((execInp: ExecutionInput, idx: number): JSX.Element => {
            return (
              <div
                key={execInp.id}
                onClick={(): void => setActiveTC(execInp.id)}
                className={`font-semibold text-nowrap select-none text-base px-2 py-0.5 rounded-sm cursor-pointer hover:ring ring-stone-700 hover:text-stone-300 duration-200 ${activeTC === execInp.id ? "bg-stone-700 text-stone-300 font-semibold" : "text-stone-400"}`}
              >
                Case {idx + 1}
              </div>
            );
          })}
        </div>
        <Button title="Reload Test Cases" onClick={(): Promise<void> => requestTestCasesFromPage()}>
          <RefreshCcw size={16} />
        </Button>
      </div>
      <div className="whitespace-pre flex flex-col gap-4 overflow-auto">
        <div className="text-stone-200">
          <div className="text-base font-semibold">Input</div>
          <div>{activeTCInput || " "}</div>
        </div>
        <div className="text-stone-200">
          <div className="text-base font-semibold">Output</div>
          <div>{activeTCResult?.stdout}</div>
        </div>
      </div>
    </div>
  );
}
