import { Theme } from "@/popup/App";

const cfDarkLogo = chrome.runtime.getURL("src/assets/cf-dark.png");

export const logoSetterFactory = (): ((theme: Theme) => void) => {
  const header: HTMLDivElement | null = document.getElementById(
    "header",
  ) as HTMLDivElement;
  const imgsInHeader: HTMLCollectionOf<HTMLImageElement> =
    header?.getElementsByTagName("img") as HTMLCollectionOf<HTMLImageElement>;
  const logoImg: HTMLImageElement | undefined = imgsInHeader?.[0];
  const originalSrc: string | undefined = logoImg?.src;
  if (logoImg) logoImg.src = cfDarkLogo;
  return (theme: Theme): void => {
    switch (theme) {
      case Theme.light:
        logoImg.src = originalSrc;
        break;
      case Theme.dark:
        logoImg.src = cfDarkLogo;
        break;
      case Theme.unknown:
        logoImg.src = originalSrc;
        break;
    }
  };
};

const setLogo: (theme: Theme) => void = logoSetterFactory();

chrome.runtime.onMessage.addListener(
  (
    message: {
      action: string;
      payload: any;
    },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ): void => {
    console.log({ message });
    if (message.action === "SET_THEME") {
      const theme = message.payload as Theme;
      setLogo(theme);
      sendResponse({
        status: "success",
      });
    }
  },
);
