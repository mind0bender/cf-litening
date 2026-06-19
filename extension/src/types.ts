import { Theme } from "./popup/App";

export type ChromeMessageActions = "TEST_CASE" | "TEST_CASE_REQUEST" | "SET_THEME";
export type TestCaseInput = string;
export type TestCaseOutput = string;
export interface TestCase {
  input: TestCaseInput;
  output: TestCaseOutput;
}
export type ChromeMessagePayloads = Theme | TestCase[];

export interface ChromeMessageT<A = ChromeMessageActions, P = ChromeMessagePayloads> {
  action: A;
  payload: P;
}

export type ThemeMessage = ChromeMessageT<"SET_THEME", Theme>;
export type TestCasesRequestMessage = ChromeMessageT<"TEST_CASE_REQUEST", undefined>;
export type TestCasesMessage = ChromeMessageT<"TEST_CASE", TestCase[]>;
