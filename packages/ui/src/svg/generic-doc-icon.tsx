import type { SVGProps } from "react";

export function GenericDocIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="2" y="2" width="36" height="44" rx="4" fill="#fff" stroke="#D0D5DD" strokeWidth="2" />
      <path d="M2 6a4 4 0 0 1 4-4h10v14H2V6z" fill="#9CA3AF" />
      <path d="M16 2l12 12v28a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V16h14V2z" fill="#fff" />
      <path d="M16 2l12 12" stroke="#D0D5DD" strokeWidth="2" />
      <path d="M8 25h8" stroke="#D0D5DD" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 30h8" stroke="#D0D5DD" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 35h16" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 38h12" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
