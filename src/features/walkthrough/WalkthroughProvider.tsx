import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useDemoData } from '../../app/DemoDataProvider';
import { demoDataset } from '../../data/demoDataset';
import type { WalkthroughModel } from './walkthroughModel';
import { DEFAULT_SCENARIO_ENQUIRY, buildWalkthroughModel, isScenarioModified } from './walkthroughModel';

/**
 * Walkthrough session state: which enquiry is being demonstrated and whether the
 * operator has started. All mutations delegate to the Stage A provider.
 */
interface WalkthroughValue {
  readonly model: WalkthroughModel;
  readonly enquiryId: string;
  readonly active: boolean;
  readonly modified: boolean;
  readonly start: (enquiryId?: string) => void;
  readonly stop: () => void;
  readonly reset: () => void;
}

const WalkthroughContext = createContext<WalkthroughValue | null>(null);

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const { dataset, resetWalkthrough } = useDemoData();
  const [enquiryId, setEnquiryId] = useState<string>(DEFAULT_SCENARIO_ENQUIRY);
  const [active, setActive] = useState(false);

  const model = useMemo(() => buildWalkthroughModel(dataset, enquiryId), [dataset, enquiryId]);
  const modified = useMemo(() => isScenarioModified(dataset, demoDataset), [dataset]);

  const start = useCallback((nextEnquiryId?: string) => {
    setEnquiryId(nextEnquiryId ?? DEFAULT_SCENARIO_ENQUIRY);
    setActive(true);
  }, []);

  const stop = useCallback(() => setActive(false), []);

  const reset = useCallback(() => {
    resetWalkthrough();
    setEnquiryId(DEFAULT_SCENARIO_ENQUIRY);
  }, [resetWalkthrough]);

  const value = useMemo<WalkthroughValue>(
    () => ({ model, enquiryId, active, modified, start, stop, reset }),
    [model, enquiryId, active, modified, start, stop, reset],
  );

  return <WalkthroughContext.Provider value={value}>{children}</WalkthroughContext.Provider>;
}

export function useWalkthrough(): WalkthroughValue {
  const value = useContext(WalkthroughContext);
  if (!value) throw new Error('useWalkthrough must be used inside <WalkthroughProvider>');
  return value;
}