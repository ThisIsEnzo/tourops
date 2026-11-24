import type { ReactNode } from 'react';
import { Badge } from './Badge';
import type { StatusPresentation } from '../../shared/ui/tone';
export function StatusBadge({ presentation }: { presentation: StatusPresentation }): ReactNode {
  return <Badge tone={presentation.tone}>{presentation.label}</Badge>;
}
