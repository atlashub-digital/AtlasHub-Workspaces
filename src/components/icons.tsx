// Line icons in the style of the Visual Pack mockups (stroke, rounded). Decorative: aria-hidden.
import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  home: <path d="M3 11.5 12 4l9 7.5M5.5 9.8V20h5v-5.5h3V20h5V9.8" />,
  team: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19.5c.8-3.3 3.2-5 6-5s5.2 1.7 6 5" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M16.5 14.6c2.3.2 3.9 1.7 4.5 4.4" />
    </>
  ),
  spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M6.3 17.7l2.8-2.8M14.9 9.1l2.8-2.8" />,
  radar: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 12 18 6" />
    </>
  ),
  community: (
    <>
      <path d="M4 18.5V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8.5L4 18.5Z" />
      <path d="M8.5 9.5h7M8.5 12.5h4.5" />
    </>
  ),
  check: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="m8.5 12.2 2.4 2.4 4.8-5" />
    </>
  ),
  chart: <path d="M5 20V10M10 20V5M15 20v-7M20 20V8M3 20h18" />,
  switch: <path d="M7 7h12l-3-3M17 17H5l3 3" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  folder: <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.2h7a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7.5Z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  logout: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l4-4-4-4M14 12H4" />,
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
