/** Currency-agnostic formatter for integer minor-unit amounts. */
export interface MinorUnitFormat {
  readonly currency: string;
  readonly locale?: string;
  readonly minorUnitDigits?: number;
  readonly currencyDisplay?: 'code' | 'symbol' | 'narrowSymbol' | 'name';
}
const FORMATTERS = new Map<string, Intl.NumberFormat>();
function formatterFor(format: MinorUnitFormat, digits: number): Intl.NumberFormat {
  const locale = format.locale ?? 'en-GB';
  const display = format.currencyDisplay ?? 'code';
  const key = `${locale}|${format.currency}|${display}|${digits}`;
  const cached = FORMATTERS.get(key);
  if (cached) return cached;
  const created = new Intl.NumberFormat(locale, {
    style: 'currency', currency: format.currency, currencyDisplay: display,
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  });
  FORMATTERS.set(key, created);
  return created;
}
export function formatMinorUnits(amountMinor: number, format: MinorUnitFormat): string {
  if (!Number.isInteger(amountMinor)) throw new Error(`Minor-unit amount must be an integer, received ${amountMinor}`);
  const digits = format.minorUnitDigits ?? 2;
  if (!Number.isInteger(digits) || digits < 0 || digits > 20) throw new RangeError(`Invalid minor-unit digits: ${digits}`);
  return formatterFor(format, digits).format(amountMinor / (10 ** digits)).replace(/[\u00A0\u202F]/g, ' ');
}
