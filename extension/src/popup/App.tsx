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
      className="flex flex-col justify-center items-center text-center text-base pt-4 p-8 gap-4 select-none w-40 text-stone-100 bg-stone-900"
    >
      <label className="flex gap-4 items-center justify-center">
        <h2 className="text-xl rotate-y-180">{isDark ? <>🌙</> : <>☀️</>}</h2>
        <Toggle value={isDark} onClick={toggleTheme} />
      </label>
      <Button onClick={toggleSidebar}>Compiler</Button>
    </div>
  );
}

export default App;
