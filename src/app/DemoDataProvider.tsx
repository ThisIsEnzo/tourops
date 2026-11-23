import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { DemoDataset } from '../types/domain';
import { createDemoDataset } from '../data/demoDataset';

/**
 * Client-side state foundation.
 *
 * Deliberately small: one context holding the synthetic dataset plus a re-seed
 * action. No Redux, no external store, no persistence. When TO-01C adds workflow
 * mutations (quote creation, conversion, assignment, deposit update, checklist
 * completion) this provider becomes a `useReducer` over the same dataset shape;
 * screens keep using `useDemoData()` and the pure selectors.
 */
interface DemoDataValue {
  readonly dataset: DemoDataset;
  /** Restore the seeded synthetic dataset. */
  readonly resetDemoData: () => void;
}

const DemoDataContext = createContext<DemoDataValue | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<DemoDataset>(createDemoDataset);
  const resetDemoData = useCallback(() => setDataset(createDemoDataset()), []);
  const value = useMemo<DemoDataValue>(() => ({ dataset, resetDemoData }), [dataset, resetDemoData]);

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData(): DemoDataValue {
  const value = useContext(DemoDataContext);
  if (!value) {
    throw new Error('useDemoData must be used inside <DemoDataProvider>');
  }
  return value;
}
