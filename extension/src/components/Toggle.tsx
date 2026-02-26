import { HTMLAttributes, JSX } from "react";

interface ToggleProps extends HTMLAttributes<HTMLButtonElement> {
  value: boolean;
}
export default function Toggle({
  className,
  value,
  ...props
}: ToggleProps): JSX.Element {
  return (
    <button
      {...props}
      className={`bg-indigo-200 rounded-full w-10 h-6 cursor-pointer relative hover:ring-3 ring-indigo-400/50 ${className}`}
    >
      <div
        className={`rounded-full w-5 h-5 bg-indigo-950 absolute top-0.5 ${!value ? "left-0.5" : "left-4.5"} duration-200`}
      />
    </button>
  );
}
