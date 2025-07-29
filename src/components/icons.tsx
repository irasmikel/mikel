import type { SVGProps } from 'react';

export function VaultIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.9a2 2 0 0 1-1.69-.9l-.81-1.2a2 2 0 0 0-1.67-.9H8.07a2 2 0 0 0-1.67.9l-.81 1.2A2 2 0 0 1 3.9 6H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
      <path d="M8 14h8" />
      <path d="M12 12v4" />
    </svg>
  );
}
