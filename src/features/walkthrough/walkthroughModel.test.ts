import { describe, expect, it } from 'vitest';
import { demoDataset } from '../../data/demoDataset';
import type { DemoDataset } from '../../types/domain';
import * as workflow from '../../lib/workflow';
import type { WorkflowResult } from '../../lib/workflow';
import { DEFAULT_SCENARIO_ENQUIRY, buildWalkthroughModel, isScenarioModified } from './walkthroughModel';

function commit<T>(result: WorkflowResult<T>): DemoDataset {
  if (!result.ok) throw new Error(`expected success: ${result.errors.map((error) => error.code).join(', ')}`);
  return result.dataset;
}

function advanceToBooking(): DemoDataset {
  const created = commit(workflow.createQuote(demoDataset, {
    enquiryId: DEFAULT_SCENARIO_ENQUIRY,
    lineItems: [{ label: 'Private catamaran charter', quantity: 1, unitPriceMinor: 4200000 }],
  }));
  const quote = created.quotes[created.quotes.length - 1];
  if (!quote) throw new Error('quote missing');
  const sent = commit(workflow.sendQuote(created, quote.id));
  const accepted = commit(workflow.acceptQuote(sent, quote.id));
  return commit(workflow.convertQuoteToBooking(accepted, { quoteId: quote.id }));
}

describe('walkthrough model', () => {
  it('starts on the enquiry stage with nothing complete', () => {
    const model = buildWalkthroughModel(demoDataset, DEFAULT_SCENARIO_ENQUIRY);
    expect(model.current?.key).toBe('enquiry');
    expect(model.completedCount).toBe(0);
    expect(model.stages).toHaveLength(7);
    expect(model.stages[0]?.route).toEqual({ screen: 'enquiry', id: DEFAULT_SCENARIO_ENQUIRY });
  });

  it('advances as the domain state changes', () => {
    const bookingState = advanceToBooking();
    const model = buildWalkthroughModel(bookingState, DEFAULT_SCENARIO_ENQUIRY);
    expect(model.quote).not.toBeNull();
    expect(model.booking).not.toBeNull();
    expect(model.departure).not.toBeNull();
    expect(model.completedCount).toBe(3);
    expect(model.current?.key).toBe('deposit');
  });

  it('marks the deposit stage complete once the deposit is recorded', () => {
    const bookingState = advanceToBooking();
    const model = buildWalkthroughModel(bookingState, DEFAULT_SCENARIO_ENQUIRY);
    const bookingId = model.booking?.id ?? '';
    const depositMinor = model.booking?.payment.depositRequired.amountMinor ?? 0;
    const paid = commit(workflow.recordDeposit(bookingState, {
      bookingId, amountMinor: depositMinor, method: 'bank_transfer', submissionId: 'model-1',
    }));
    expect(buildWalkthroughModel(paid, DEFAULT_SCENARIO_ENQUIRY).current?.key).toBe('resources');
  });

  it('reaches completion only through real state', () => {
    let dataset = advanceToBooking();
    let model = buildWalkthroughModel(dataset, DEFAULT_SCENARIO_ENQUIRY);
    const bookingId = model.booking?.id ?? '';
    const departureId = model.departure?.id ?? '';
    dataset = commit(workflow.recordDeposit(dataset, {
      bookingId, amountMinor: model.booking?.payment.depositRequired.amountMinor ?? 0,
      method: 'bank_transfer', submissionId: 'model-2',
    }));
    for (const input of [
      { kind: 'vessel' as const, resourceId: 'demo-vsl-001' },
      { kind: 'crew' as const, resourceId: 'demo-crew-001' },
      { kind: 'crew' as const, resourceId: 'demo-crew-004' },
      { kind: 'equipment' as const, resourceId: 'demo-eqp-005', units: 16 },
      { kind: 'equipment' as const, resourceId: 'demo-eqp-001', units: 16 },
    ]) {
      dataset = commit(workflow.assignResource(dataset, { departureId, ...input }));
    }
    model = buildWalkthroughModel(dataset, DEFAULT_SCENARIO_ENQUIRY);
    expect(model.current?.key).toBe('preparation');
    for (const item of dataset.checklist.filter((row) => row.departureId === departureId && row.required)) {
      dataset = commit(workflow.updateChecklistItem(dataset, { itemId: item.id, status: 'done' }));
    }
    model = buildWalkthroughModel(dataset, DEFAULT_SCENARIO_ENQUIRY);
    expect(model.isComplete).toBe(true);
    expect(model.readiness?.isReady).toBe(true);
    expect(model.current).toBeNull();
  });

  it('detects modification against the seed', () => {
    expect(isScenarioModified(demoDataset, demoDataset)).toBe(false);
    expect(isScenarioModified(advanceToBooking(), demoDataset)).toBe(true);
    expect(isScenarioModified(workflow.cloneDataset(demoDataset), demoDataset)).toBe(false);
  });
});