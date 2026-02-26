import { HTMLAttributes, JSX } from "react";

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {}

export default function Button({
  children,
  style,
  className,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      {...props}
      className={`px-2 py-1 border border-indigo-200 text-indigo-200 rounded-md cursor-pointer hover:bg-indigo-200/10 duration-200 ${className}`}
    >
      {children}
    </button>
  );
}
