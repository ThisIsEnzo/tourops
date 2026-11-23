import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { ChecklistItem, DemoDataset, PaymentEntry, Quote, ResourceAssignment } from '../types/domain';
import { demoDataset } from '../data/demoDataset';
import type {
  AssignResourceInput, ConversionResult, ConvertQuoteInput, CreateQuoteInput, QuoteDraft,
  RecordDepositInput, UpdateChecklistInput, WorkflowResult,
} from '../lib/workflow';
import * as workflow from '../lib/workflow';

/**
 * In-memory application state for the demo workflow (TO-01C-A).
 *
 * - All business rules live in `src/lib/workflow.ts`; this provider only holds
 *   state and applies successful results.
 * - A ref mirrors the committed dataset so several actions dispatched in the
 *   same tick compose correctly and atomically.
 * - Failed operations never touch state.
 * - No persistence, no backend, no external store.
 */
interface DemoDataValue {
  readonly dataset: DemoDataset;
  /** Kept for TO-01B callers. */
  readonly resetDemoData: () => void;
  readonly resetWalkthrough: () => void;
  readonly prepareQuoteFromEnquiry: (enquiryId: string) => WorkflowResult<QuoteDraft>;
  readonly createQuote: (input: CreateQuoteInput) => WorkflowResult<Quote>;
  readonly sendQuote: (quoteId: string) => WorkflowResult<Quote>;
  readonly acceptQuote: (quoteId: string) => WorkflowResult<Quote>;
  readonly convertQuoteToBooking: (input: ConvertQuoteInput) => WorkflowResult<ConversionResult>;
  readonly recordDeposit: (input: RecordDepositInput) => WorkflowResult<PaymentEntry>;
  readonly assignResource: (input: AssignResourceInput) => WorkflowResult<ResourceAssignment>;
  readonly updateChecklistItem: (input: UpdateChecklistInput) => WorkflowResult<ChecklistItem>;
}

const DemoDataContext = createContext<DemoDataValue | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<DemoDataset>(() => workflow.cloneDataset(demoDataset));
  const current = useRef<DemoDataset>(dataset);

  const apply = useCallback(function apply<T>(operation: (state: DemoDataset) => WorkflowResult<T>): WorkflowResult<T> {
    const result = operation(current.current);
    if (result.ok) {
      current.current = result.dataset;
      setDataset(result.dataset);
    }
    return result;
  }, []);

  const resetWalkthrough = useCallback(() => {
    const fresh = workflow.createWalkthroughDataset(demoDataset);
    current.current = fresh;
    setDataset(fresh);
  }, []);

  const prepareQuoteFromEnquiry = useCallback(
    (enquiryId: string) => workflow.prepareQuoteFromEnquiry(current.current, enquiryId),
    [],
  );
  const createQuote = useCallback((input: CreateQuoteInput) => apply((state) => workflow.createQuote(state, input)), [apply]);
  const sendQuote = useCallback((quoteId: string) => apply((state) => workflow.sendQuote(state, quoteId)), [apply]);
  const acceptQuote = useCallback((quoteId: string) => apply((state) => workflow.acceptQuote(state, quoteId)), [apply]);
  const convertQuoteToBooking = useCallback(
    (input: ConvertQuoteInput) => apply((state) => workflow.convertQuoteToBooking(state, input)),
    [apply],
  );
  const recordDeposit = useCallback((input: RecordDepositInput) => apply((state) => workflow.recordDeposit(state, input)), [apply]);
  const assignResource = useCallback((input: AssignResourceInput) => apply((state) => workflow.assignResource(state, input)), [apply]);
  const updateChecklistItem = useCallback(
    (input: UpdateChecklistInput) => apply((state) => workflow.updateChecklistItem(state, input)),
    [apply],
  );

  const value = useMemo<DemoDataValue>(() => ({
    dataset,
    resetDemoData: resetWalkthrough,
    resetWalkthrough,
    prepareQuoteFromEnquiry,
    createQuote,
    sendQuote,
    acceptQuote,
    convertQuoteToBooking,
    recordDeposit,
    assignResource,
    updateChecklistItem,
  }), [
    dataset, resetWalkthrough, prepareQuoteFromEnquiry, createQuote, sendQuote, acceptQuote,
    convertQuoteToBooking, recordDeposit, assignResource, updateChecklistItem,
  ]);

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData(): DemoDataValue {
  const value = useContext(DemoDataContext);
  if (!value) {
    throw new Error('useDemoData must be used inside <DemoDataProvider>');
  }
  return value;
}