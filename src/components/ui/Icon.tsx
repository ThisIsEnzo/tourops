import type { ReactNode } from 'react';

export type IconName =
  | 'overview' | 'enquiries' | 'quotes' | 'bookings' | 'departures' | 'resources'
  | 'search' | 'close' | 'menu' | 'back' | 'chevron' | 'alert' | 'check' | 'clock' | 'anchor' | 'arrow';

const PATHS: Record<IconName, ReactNode> = {
  overview: <path d="M4 13h6V4H4zM14 20h6v-9h-6zM4 20h6v-4H4zM14 8h6V4h-6z" />,
  enquiries: <path d="M4 5h16v11H8l-4 4z" />,
  quotes: <><path d="M7 3h7l5 5v13H7zM14 3v5h5" /><path d="M10 13h7M10 17h5" /></>,
  bookings: <><path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" /><path d="m9 15 2 2 4-4" /></>,
  departures: <><path d="M4 18c2 0 2 1.5 4 1.5S10 18 12 18s2 1.5 4 1.5S18 18 20 18" /><path d="M6 14 12 4l6 10z" /></>,
  resources: <><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 13 9 5 9-5" /></>,
  search: <><circle cx="11" cy="11" r="6" /><path d="m20 20-3.6-3.6" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  back: <path d="m14 6-6 6 6 6" />,
  chevron: <path d="m10 6 6 6-6 6" />,
  alert: <><path d="M12 4 2.5 20h19z" /><path d="M12 10v4M12 17h.01" /></>,
  check: <path d="m5 13 4 4 10-10" />,
  clock: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></>,
  anchor: <><circle cx="12" cy="5" r="2" /><path d="M12 7v13M5 13a7 7 0 0 0 14 0M8 11H4M20 11h-4" /></>,
  arrow: <path d="M7 17 17 7M9 7h8v8" />,
};

export function Icon({ name, size = 16 }: { name: IconName; size?: number }): ReactNode {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false">
      {PATHS[name]}
    </svg>
  );
}