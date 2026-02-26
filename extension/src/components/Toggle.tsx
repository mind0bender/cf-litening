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
      className={`${value ? "bg-indigo-200" : "bg-stone-600"} rounded-full w-10 h-6 cursor-pointer relative ring ring-stone-500 ${className} duration-200`}
    >
      <div
        className={`rounded-full w-4 h-4 bg-indigo-950 absolute top-1 ${value ? "left-5 bg-indigo-950" : "left-1 bg-stone-50"} duration-200`}
      />
    </button>
  );
}
