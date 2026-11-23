import type { ReactNode } from 'react';
import type { StatusTone } from '../../lib/status';

/** Status indicator driven by design tokens — never by ad-hoc colours. */
export function Badge({ tone, children }: { tone: StatusTone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
