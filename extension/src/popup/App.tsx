import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import { JSX, useCallback, useState } from "react";

function App(): JSX.Element {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = useCallback(
    (): void => setIsDark((pD: boolean): boolean => !pD),
    [],
  );

  const toggleSidebar = useCallback((): void => {
    chrome.windows.getCurrent((window): void => {
      if (!window.id) return;
      chrome.sidePanel.open({
        windowId: window.id,
      });
    });
  }, []);

  return (
    <div
      id="app"
      className="flex flex-col justify-center items-center text-center pt-4 p-8 gap-4 select-none w-56 text-stone-100 bg-stone-900"
    >
      <h1 className="text-amber-500 text-2xl font-semibold">
        Codeforces Litening
      </h1>
      <label className="flex gap-4 items-center justify-center">
        <h2 className="text-2xl w-14">{isDark ? <>Dark</> : <>Light</>}</h2>
        <Toggle value={isDark} onClick={toggleTheme} />
      </label>
      <Button onClick={toggleSidebar}>Compiler</Button>
    </div>
  );
}

export default App;
