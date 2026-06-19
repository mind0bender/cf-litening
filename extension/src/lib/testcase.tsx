import { TestCase, TestCasesMessage, TestCasesRequestMessage } from "@/types";

function scrapeTestCase(): TestCase[] {
  const testCases: TestCase[] = [];
  let currTC: number = 1;
  while (true) {
    const currTCthInpLines: NodeListOf<HTMLDivElement> = document.querySelectorAll(
      `.input .test-example-line-${currTC}`,
    );
    const currTCthOutLines: NodeListOf<HTMLDivElement> = document.querySelectorAll(
      `.output .test-example-line-${currTC}`,
    );
    if (!(currTCthInpLines.length + currTCthOutLines.length)) break;
    testCases[currTC - 1] = {
      input: "",
      output: "",
    } satisfies TestCase;
    currTCthInpLines.forEach((currTCthInpLine: Element): void => {
      const match = currTCthInpLine.className.match(/test-example-line-(\d+)/);
      if (match) {
        testCases[currTC - 1].input += currTCthInpLine.textContent + "\n";
      }
    });
    currTCthOutLines.forEach((currTCthOutLine: Element): void => {
      const match = currTCthOutLine.className.match(/test-example-line-(\d+)/);
      if (match) {
        testCases[currTC - 1].output += currTCthOutLine.textContent + "\n";
      }
    });

    currTC++;
  }

  return testCases;
}

chrome.runtime.onMessage.addListener(
  (
    message: TestCasesRequestMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: TestCasesMessage) => void,
  ): boolean | void => {
    if (message.action === "TEST_CASE_REQUEST") {
      sendTestCase(sendResponse);
      return true;
    }
  },
);

function sendTestCase(sendResponse: (response?: any) => void): void {
  const scrapedTestCase = scrapeTestCase();
  console.log({ scrapedTestCase });
  sendResponse({ action: "TEST_CASE", payload: scrapedTestCase });
}
