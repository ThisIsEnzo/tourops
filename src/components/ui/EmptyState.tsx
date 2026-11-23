import type { ReactNode } from 'react';
import { Icon } from './Icon';

export function EmptyState({ title, hint, action }: {
  title: string; hint: string; action?: { label: string; onClick: () => void };
}): ReactNode {
  return (
    <div className="empty-state">
      <span className="empty-state__mark"><Icon name="search" size={20} /></span>
      <p className="empty-state__title">{title}</p>
      <p className="empty-state__hint">{hint}</p>
      {action ? <button type="button" onClick={action.onClick}>{action.label}</button> : null}
    </div>
  );
}