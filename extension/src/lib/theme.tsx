import { Theme } from "@/popup/App";

const setCFDark = (theme: Theme): void => {
  switch (theme) {
    case Theme.light:
      document.body.classList.remove("cf-dark");
      break;
    case Theme.dark:
      document.body.classList.add("cf-dark");
      break;
    case Theme.unknown:
      document.body.classList.remove("cf-dark");
      break;
  }
};

chrome.runtime.onMessage.addListener(
  (
    message: {
      action: string;
      payload: any;
    },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ): void => {
    console.log({ message });
    if (sender.id === chrome.runtime.id && message.action === "SET_THEME") {
      const theme = message.payload as Theme;
      setCFDark(theme);
      sendResponse({
        status: "success",
      });
    }
  },
);

const { theme: lastTheme }: { theme: Theme } =
  (await chrome.storage.local.get("theme")) ?? 1;

setCFDark(lastTheme);
