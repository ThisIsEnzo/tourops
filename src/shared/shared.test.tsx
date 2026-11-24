// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { act, cleanup, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { formatMinorUnits } from './money/format';
import { integerFromInput, minorUnitsFromInput } from './forms/parse';
import { statusOptions } from './ui/option';
import { setHash, useHash } from './navigation/hashLocation';
import { ErrorBoundary } from './errors/ErrorBoundary';

describe('shared money formatting', () => {
  it('formats multiple currencies and normalizes spacing', () => {
    expect(formatMinorUnits(2800000, { currency: 'THB' })).toBe('THB 28,000.00');
    expect(formatMinorUnits(123450, { currency: 'USD', locale: 'en-US' })).toBe('USD 1,234.50');
    expect(formatMinorUnits(1234, { currency: 'JPY', minorUnitDigits: 0 })).toBe('JPY 1,234');
    expect(formatMinorUnits(-840000, { currency: 'THB' })).toBe('-THB 8,400.00');
    expect(formatMinorUnits(123456789, { currency: 'THB' })).not.toMatch(/[\u00A0\u202F]/);
  });
  it('rejects invalid minor-unit amounts and scales', () => {
    expect(() => formatMinorUnits(1.2, { currency: 'THB' })).toThrow();
    expect(() => formatMinorUnits(1, { currency: 'THB', minorUnitDigits: -1 })).toThrow(RangeError);
  });
});

describe('shared input parsing', () => {
  it('preserves existing parse/rounding semantics', () => {
    expect(minorUnitsFromInput('12.5')).toBe(1250);
    expect(minorUnitsFromInput('abc')).toBe(0);
    expect(minorUnitsFromInput('-5')).toBe(-500);
    expect(integerFromInput('2.9')).toBe(2);
    expect(integerFromInput('-3')).toBe(-3);
  });
});

describe('shared options', () => {
  it('prepends all and preserves map order', () => {
    expect(statusOptions({ pending: { label: 'Pending' }, quoted: { label: 'Quoted' } }, 'All')).toEqual([
      { value: 'all', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'quoted', label: 'Quoted' },
    ]);
  });
});

describe('shared hash location', () => {
  afterEach(() => { window.location.hash = ''; });
  it('subscribes to changes and exposes a reliable write result', async () => {
    window.location.hash = '#/overview';
    const { result } = renderHook(() => useHash());
    expect(result.current).toBe('#/overview');
    act(() => { window.location.hash = '#/enquiries'; });
    await waitFor(() => expect(result.current).toBe('#/enquiries'));
    expect(setHash('#/enquiries')).toBe(false);
    expect(setHash('#/quotes')).toBe(true);
  });
  it('removes the hashchange listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useHash());
    unmount();
    expect(removeSpy).toHaveBeenCalledWith('hashchange', expect.any(Function));
    removeSpy.mockRestore();
  });
});

let shouldThrow = true;
function MaybeBomb(): ReactNode {
  if (shouldThrow) throw new Error('boundary-test');
  return <p>recovered content</p>;
}
describe('shared error boundary', () => {
  beforeEach(() => { shouldThrow = true; vi.spyOn(console, 'error').mockImplementation(() => undefined); });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); shouldThrow = false; });
  it('contains render errors and allows retry', async () => {
    const user = userEvent.setup();
    render(<ErrorBoundary><MaybeBomb /></ErrorBoundary>);
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByText(/boundary-test/)).toBeTruthy();
    shouldThrow = false;
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('recovered content')).toBeTruthy();
  });
  it('resets when a route key changes', async () => {
    const { rerender } = render(<ErrorBoundary key="first"><MaybeBomb /></ErrorBoundary>);
    await screen.findByRole('alert');
    shouldThrow = false;
    rerender(<ErrorBoundary key="second"><MaybeBomb /></ErrorBoundary>);
    expect(await screen.findByText('recovered content')).toBeTruthy();
  });
});
