import type { ReactNode } from 'react';

export function Meter({ done, total, blocked = 0, label }: {
  done: number; total: number; blocked?: number; label?: string;
}): ReactNode {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const blockedPct = total === 0 ? 0 : Math.round((blocked / total) * 100);
  return (
    <div className="meter" title={label ?? `${done} of ${total} complete`}>
      <span className="meter__track">
        <span className="meter__fill" style={{ width: `${pct}%` }} />
        {blocked > 0 ? <span className="meter__blocked" style={{ width: `${blockedPct}%` }} /> : null}
      </span>
      <span className="meter__label">{done}/{total}{blocked > 0 ? ` · ${blocked} blocked` : ''}</span>
    </div>
  );
}