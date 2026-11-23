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
import { BOOKING_SORT_OPTIONS, DEFAULT_BOOKING_FILTER, filterBookings, statusOptions } from '../../lib/filters';
import type { BookingFilter, BookingSort } from '../../lib/filters';
import { BOOKING_STATUS, PAYMENT_STATUS } from '../../lib/status';
import type { Booking, BookingStatus, PaymentStatus } from '../../types/domain';
import { bookingCustomer, bookingDeparture, bookingExperience, guestsOf } from '../../lib/operations';
import { amountReceived, formatMoney, outstandingBalance } from '../../lib/money';
import { formatDate } from '../../lib/datetime';

const STATUS_OPTIONS = statusOptions(BOOKING_STATUS, 'All bookings');
const PAYMENT_OPTIONS = statusOptions(PAYMENT_STATUS, 'All payment states');

export function BookingsScreen({ navigate }: ScreenProps): ReactNode {
  const { dataset } = useDemoData();
  const [filter, setFilter] = useState<BookingFilter>(DEFAULT_BOOKING_FILTER);
  const rows = useMemo(() => filterBookings(dataset, filter), [dataset, filter]);
  const patch = (next: Partial<BookingFilter>): void => setFilter((current) => ({ ...current, ...next }));

  const columns: readonly Column<Booking>[] = [
    { key: 'ref', header: 'Reference', render: (row) => <span className="mono cell-strong">{row.reference}</span> },
    { key: 'customer', header: 'Customer', render: (row) => bookingCustomer(dataset, row)?.displayName ?? '—' },
    { key: 'experience', header: 'Experience', render: (row) => <span className="cell-sub">{bookingExperience(dataset, row)?.name ?? '—'}</span> },
    { key: 'departure', header: 'Departure', render: (row) => {
      const departure = bookingDeparture(dataset, row);
      return departure ? <span className="cell-stack"><span>{formatDate(departure.date)}</span><span className="cell-sub">{departure.departureTime}</span></span> : '—';
    } },
    { key: 'guests', header: 'Guests', align: 'right', render: (row) => <span className="mono">{guestsOf(row)}</span> },
    { key: 'status', header: 'Booking', render: (row) => <StatusBadge presentation={BOOKING_STATUS[row.status]} /> },
    { key: 'payment', header: 'Payment', render: (row) => <StatusBadge presentation={PAYMENT_STATUS[row.payment.status]} /> },
    { key: 'total', header: 'Total', align: 'right', render: (row) => <span className="mono">{formatMoney(row.payment.total)}</span> },
    { key: 'received', header: 'Received', align: 'right', render: (row) => <span className="mono">{formatMoney(amountReceived(row.payment))}</span> },
    { key: 'outstanding', header: 'Outstanding', align: 'right', render: (row) => {
      const outstanding = outstandingBalance(row.payment);
      return <span className={outstanding.amountMinor > 0 ? 'mono is-critical' : 'mono'}>{formatMoney(outstanding)}</span>;
    } },
  ];

  return (
    <div className="page">
      <PageHeader title="Bookings" subtitle="Confirmed and held trips with manually recorded payment state"
        crumbs={[{ label: 'Overview', onClick: () => navigate({ screen: 'dashboard' }) }, { label: 'Bookings' }]} />
      <Panel title={`${rows.length} of ${dataset.bookings.length} bookings`} description="No payment processing — amounts are recorded snapshots">
        <Toolbar query={filter.query} onQuery={(query) => patch({ query })} placeholder="Search bookings…">
          <FilterSelect label="Booking" value={filter.status} options={STATUS_OPTIONS}
            onChange={(status: BookingStatus | 'all') => patch({ status })} />
          <FilterSelect label="Payment" value={filter.payment} options={PAYMENT_OPTIONS}
            onChange={(payment: PaymentStatus | 'all') => patch({ payment })} />
          <FilterSelect label="Sort" value={filter.sort} options={BOOKING_SORT_OPTIONS}
            onChange={(sort: BookingSort) => patch({ sort })} />
        </Toolbar>
        {rows.length === 0 ? (
          <EmptyState title="No bookings match" hint="Try another reference or payment state."
            action={{ label: 'Clear filters', onClick: () => setFilter(DEFAULT_BOOKING_FILTER) }} />
        ) : (
          <DataTable caption="Bookings" columns={columns} rows={rows}
            onSelect={(row) => navigate({ screen: 'booking', id: row.id })} />
        )}
      </Panel>
    </div>
  );
}