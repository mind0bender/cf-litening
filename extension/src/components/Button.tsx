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
      style={{
        paddingTop: ".3rem",
        paddingBottom: ".3rem",
        paddingRight: ".6rem",
        paddingLeft: ".6rem",
        ...style,
      }}
      className={`ring ring-stone-700 bg-indigo-200 text-indigo-950 rounded-md text-lg font-semibold cursor-pointer hover:ring-3 hover:ring-indigo-400/50 duration-200 ${className}`}
    >
      {children}
    </button>
  );
}
