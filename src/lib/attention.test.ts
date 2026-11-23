import { describe, expect, it } from 'vitest';
import { demoDataset } from '../data/demoDataset';
import { attentionItems } from './attention';

describe('attention signals', () => {
  const items = attentionItems(demoDataset);

  it('flags the blocked corporate departure as critical', () => {
    expect(items.some((item) => item.target.entity === 'departure' && item.target.id === 'demo-dep-002' && item.severity === 'critical')).toBe(true);
  });

  it('flags the expiring quote and the outstanding balance', () => {
    expect(items.some((item) => item.kind === 'quote' && item.target.id === 'demo-quo-001')).toBe(true);
    expect(items.some((item) => item.kind === 'deposit' && item.target.id === 'demo-bkg-002' && item.severity === 'critical')).toBe(true);
  });

  it('ignores declined and expired enquiries', () => {
    expect(items.some((item) => item.target.id === 'demo-enq-007')).toBe(false);
    expect(items.some((item) => item.target.id === 'demo-enq-005')).toBe(false);
  });

  it('sorts critical signals first', () => {
    expect(items[0]?.severity).toBe('critical');
  });
});