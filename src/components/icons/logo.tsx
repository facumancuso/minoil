import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2l4 6H8l4-6z" fill="currentColor" />
      <path d="M4 8h16" />
      <path d="M4 12h16" />
      <path d="M10 12v8" />
      <path d="M14 12v8" />
      <path d="M6 12l-2 4h20l-2-4" />
      <path d="M6 20h12" />
    </svg>
  );
}
