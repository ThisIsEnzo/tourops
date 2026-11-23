import type { ReactNode } from 'react';
import { Badge } from './Badge';
import type { StatusPresentation } from '../../lib/status';

export function StatusBadge({ presentation }: { presentation: StatusPresentation }): ReactNode {
  return <Badge tone={presentation.tone}>{presentation.label}</Badge>;
}