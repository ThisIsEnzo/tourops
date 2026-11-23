import type { ReactNode } from 'react';

export function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }): ReactNode {
  return (
    <div className={wide ? 'field field--wide' : 'field'}>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function FieldGrid({ children, columns = 2 }: { children: ReactNode; columns?: 1 | 2 | 3 }): ReactNode {
  return <dl className={`field-grid field-grid--${columns}`}>{children}</dl>;
}