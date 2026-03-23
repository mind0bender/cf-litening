import Button from "@/components/Button";
import Toggle from "@/components/Toggle";
import { JSX, useCallback, useEffect, useState } from "react";

export enum Theme {
  unknown,
  light,
  dark,
}

function App(): JSX.Element {
  const [theme, setTheme] = useState<Theme>(Theme.unknown);

  useEffect((): void => {
    (async (): Promise<void> => {
      const { theme: lastTheme }: { theme: Theme } =
        (await chrome.storage.local.get("theme")) ?? 1;
      setTheme(lastTheme);
      sendThemeToContent(lastTheme);
    })();
  }, []);

  const sendThemeToContent = useCallback(
    async (theme: Theme): Promise<void> => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: "SET_THEME",
          payload: theme,
        });
      }
    },
    [],
  );

  const toggleTheme = useCallback(async (): Promise<void> => {
    const newTheme: Theme = theme === Theme.light ? Theme.dark : Theme.light;
    await chrome.storage.local.set({ theme: newTheme });
    setTheme(newTheme);
    sendThemeToContent(newTheme);
  }, [theme]);

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
        <h2 className="text-lg rotate-y-180">
          {theme === Theme.unknown ? (
            <>?</>
          ) : theme === Theme.dark ? (
            <>🌙</>
          ) : (
            <>☀️</>
          )}
        </h2>
        <Toggle value={theme === Theme.dark} onClick={toggleTheme} />
      </label>
      <Button onClick={toggleSidebar}>Compiler</Button>
    </div>
  );
}

export default App;
