import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useDemoData } from '../../app/DemoDataProvider';
import type { ScreenProps } from '../../app/navigation';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { DataTable } from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { Toolbar, FilterSelect } from '../../components/ui/Toolbar';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DEFAULT_QUOTE_FILTER, QUOTE_SORT_OPTIONS, filterQuotes, statusOptions } from '../../lib/filters';
import type { QuoteFilter, QuoteSort } from '../../lib/filters';
import { QUOTE_STATUS } from '../../lib/status';
import type { Quote, QuoteStatus } from '../../types/domain';
import { quoteCustomer, quoteExperience, daysBetween } from '../../lib/operations';
import { formatDate, formatDateTime } from '../../lib/datetime';
import { formatMoney } from '../../lib/money';

const STATUS_OPTIONS = statusOptions(QUOTE_STATUS, 'All statuses');

export function QuotesScreen({ navigate }: ScreenProps): ReactNode {
  const { dataset } = useDemoData();
  const [filter, setFilter] = useState<QuoteFilter>(DEFAULT_QUOTE_FILTER);
  const rows = useMemo(() => filterQuotes(dataset, filter), [dataset, filter]);
  const patch = (next: Partial<QuoteFilter>): void => setFilter((current) => ({ ...current, ...next }));

  const columns: readonly Column<Quote>[] = [
    { key: 'ref', header: 'Reference', render: (row) => <span className="mono cell-strong">{row.reference}</span> },
    { key: 'customer', header: 'Customer', render: (row) => quoteCustomer(dataset, row)?.displayName ?? '—' },
    { key: 'experience', header: 'Experience', render: (row) => <span className="cell-sub">{quoteExperience(dataset, row)?.name ?? '—'}</span> },
    { key: 'issued', header: 'Issued', render: (row) => formatDateTime(row.issuedAt) },
    { key: 'valid', header: 'Valid until', render: (row) => {
      const left = daysBetween(dataset.meta.referenceDate, row.validUntil);
      return (
        <span className="cell-stack">
          <span>{formatDate(row.validUntil)}</span>
          {row.status === 'sent' ? <span className={left <= 1 ? 'cell-sub is-critical' : 'cell-sub'}>{left < 0 ? 'lapsed' : `${left} day(s) left`}</span> : null}
        </span>
      );
    } },
    { key: 'total', header: 'Total', align: 'right', render: (row) => <span className="mono cell-strong">{formatMoney(row.total)}</span> },
    { key: 'deposit', header: 'Deposit', align: 'right', render: (row) => <span className="mono">{formatMoney(row.depositRequired)}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge presentation={QUOTE_STATUS[row.status]} /> },
  ];

  return (
    <div className="page">
      <PageHeader title="Quotes" subtitle="Prepared pricing, validity and deposit requirements"
        crumbs={[{ label: 'Overview', onClick: () => navigate({ screen: 'dashboard' }) }, { label: 'Quotes' }]} />
      <Panel title={`${rows.length} of ${dataset.quotes.length} quotes`} description="Presentation only — sending and acceptance are out of scope">
        <Toolbar query={filter.query} onQuery={(query) => patch({ query })} placeholder="Search quotes…">
          <FilterSelect label="Status" value={filter.status} options={STATUS_OPTIONS}
            onChange={(status: QuoteStatus | 'all') => patch({ status })} />
          <FilterSelect label="Sort" value={filter.sort} options={QUOTE_SORT_OPTIONS}
            onChange={(sort: QuoteSort) => patch({ sort })} />
        </Toolbar>
        {rows.length === 0 ? (
          <EmptyState title="No quotes match" hint="Adjust the search text or status filter."
            action={{ label: 'Clear filters', onClick: () => setFilter(DEFAULT_QUOTE_FILTER) }} />
        ) : (
          <DataTable caption="Quotes" columns={columns} rows={rows}
            onSelect={(row) => navigate({ screen: 'quote', id: row.id })} />
        )}
      </Panel>
    </div>
  );
}