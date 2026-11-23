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
import { DEFAULT_ENQUIRY_FILTER, ENQUIRY_SORT_OPTIONS, filterEnquiries, statusOptions } from '../../lib/filters';
import type { EnquiryFilter, EnquirySort } from '../../lib/filters';
import { CHANNEL_LABEL, ENQUIRY_STATUS } from '../../lib/status';
import type { EnquiryChannel, EnquiryStatus } from '../../types/domain';
import { formatDate } from '../../lib/datetime';
import { formatMoney } from '../../lib/money';
import { findById } from '../../lib/selectors';
import type { Enquiry } from '../../types/domain';

const STATUS_OPTIONS = statusOptions(ENQUIRY_STATUS, 'All statuses');
const CHANNEL_OPTIONS: readonly { value: EnquiryChannel | 'all'; label: string }[] = [
  { value: 'all', label: 'All channels' },
  ...(Object.keys(CHANNEL_LABEL) as EnquiryChannel[]).map((key) => ({ value: key, label: CHANNEL_LABEL[key] })),
];

export function EnquiriesScreen({ navigate }: ScreenProps): ReactNode {
  const { dataset } = useDemoData();
  const [filter, setFilter] = useState<EnquiryFilter>(DEFAULT_ENQUIRY_FILTER);
  const rows = useMemo(() => filterEnquiries(dataset, filter), [dataset, filter]);
  const patch = (next: Partial<EnquiryFilter>): void => setFilter((current) => ({ ...current, ...next }));

  const columns: readonly Column<Enquiry>[] = [
    { key: 'ref', header: 'Reference', render: (row) => <span className="mono cell-strong">{row.reference}</span> },
    { key: 'customer', header: 'Customer', render: (row) => (
      <span className="cell-stack">
        <span className="cell-strong">{findById(dataset.customers, row.customerId)?.displayName ?? '—'}</span>
        <span className="cell-sub">{findById(dataset.customers, row.customerId)?.contactName ?? ''}</span>
      </span>
    ) },
    { key: 'experience', header: 'Experience', render: (row) => row.experienceId ? findById(dataset.experiences, row.experienceId)?.name ?? '—' : '—' },
    { key: 'date', header: 'Requested date', render: (row) => (
      <span className="cell-stack"><span>{formatDate(row.preferredDate)}</span>{row.flexibleDates ? <span className="cell-sub">flexible</span> : null}</span>
    ) },
    { key: 'party', header: 'Adults / children', align: 'right', render: (row) => <span className="mono">{row.party.adults} / {row.party.children}</span> },
    { key: 'channel', header: 'Channel', render: (row) => CHANNEL_LABEL[row.channel] },
    { key: 'value', header: 'Est. value', align: 'right', render: (row) => <span className="mono">{row.estimatedValue ? formatMoney(row.estimatedValue) : '—'}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge presentation={ENQUIRY_STATUS[row.status]} /> },
  ];

  return (
    <div className="page">
      <PageHeader title="Enquiries" subtitle="Every inbound request in the synthetic pipeline"
        crumbs={[{ label: 'Overview', onClick: () => navigate({ screen: 'dashboard' }) }, { label: 'Enquiries' }]} />
      <Panel title={`${rows.length} of ${dataset.enquiries.length} enquiries`}
        description="Search across reference, guest, experience and notes">
        <Toolbar query={filter.query} onQuery={(query) => patch({ query })} placeholder="Search enquiries…">
          <FilterSelect label="Status" value={filter.status} options={STATUS_OPTIONS}
            onChange={(status: EnquiryStatus | 'all') => patch({ status })} />
          <FilterSelect label="Channel" value={filter.channel} options={CHANNEL_OPTIONS}
            onChange={(channel: EnquiryChannel | 'all') => patch({ channel })} />
          <FilterSelect label="Sort" value={filter.sort} options={ENQUIRY_SORT_OPTIONS}
            onChange={(sort: EnquirySort) => patch({ sort })} />
        </Toolbar>
        {rows.length === 0 ? (
          <EmptyState title="No enquiries match" hint="Try a different reference, guest name or status."
            action={{ label: 'Clear filters', onClick: () => setFilter(DEFAULT_ENQUIRY_FILTER) }} />
        ) : (
          <DataTable caption="Enquiries" columns={columns} rows={rows}
            onSelect={(row) => navigate({ screen: 'enquiry', id: row.id })} />
        )}
      </Panel>
    </div>
  );
}