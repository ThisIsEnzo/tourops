import { useMemo } from 'react';
import { useDemoData } from '../../app/DemoDataProvider';
import { Badge } from '../../components/ui/Badge';
import { Panel } from '../../components/ui/Panel';
import { validateDemoDataset } from '../../data/validateDataset';
import { formatDate } from '../../lib/datetime';
import { formatMoney } from '../../lib/money';
import { enquiryStatusCounts, openPipelineValue } from '../../lib/selectors';
import { CHECKLIST_STATUS, DEPARTURE_STATUS, ENQUIRY_STATUS, PAYMENT_STATUS } from '../../lib/status';
import type { DemoDataset } from '../../types/domain';

/**
 * TO-01A foundation preview — NOT a product screen.
 * It proves the data layer, selectors, integrity checks and design tokens work.
 */
const COLLECTIONS: readonly { key: keyof Omit<DemoDataset, 'meta'>; label: string }[] = [
  { key: 'experiences', label: 'Experiences' },
  { key: 'customers', label: 'Customers' },
  { key: 'enquiries', label: 'Enquiries' },
  { key: 'quotes', label: 'Quotes' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'vessels', label: 'Vessels' },
  { key: 'crew', label: 'Crew' },
  { key: 'guides', label: 'Guides' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'departures', label: 'Departures' },
  { key: 'assignments', label: 'Resource assignments' },
  { key: 'checklist', label: 'Checklist items' },
];

const SWATCHES: readonly { token: string; label: string }[] = [
  { token: '--color-brand-deep', label: 'Brand deep' },
  { token: '--color-brand-marine', label: 'Marine' },
  { token: '--color-accent-brass', label: 'Brass accent' },
  { token: '--surface-canvas', label: 'Canvas' },
  { token: '--surface-raised', label: 'Raised surface' },
  { token: '--surface-sunken', label: 'Sunken surface' },
  { token: '--border-subtle', label: 'Hairline border' },
  { token: '--status-positive', label: 'Positive' },
  { token: '--status-attention', label: 'Attention' },
  { token: '--status-critical', label: 'Critical' },
];

const TYPE_SCALE: readonly { token: string; sample: string }[] = [
  { token: '--text-2xl', sample: 'Departure run sheet' },
  { token: '--text-xl', sample: 'Siam Blue Charters' },
  { token: '--text-lg', sample: 'Sunset cruise — 14 guests' },
  { token: '--text-md', sample: 'Section heading' },
  { token: '--text-base', sample: 'Body copy for operational detail.' },
  { token: '--text-sm', sample: 'Secondary detail and table cells.' },
  { token: '--text-xs', sample: 'Micro label' },
];

const SPACING = ['--space-1', '--space-2', '--space-3', '--space-4', '--space-5', '--space-6'];
const RADII = ['--radius-sm', '--radius-md', '--radius-lg'];
const STATUS_GROUPS = [ENQUIRY_STATUS, PAYMENT_STATUS, DEPARTURE_STATUS, CHECKLIST_STATUS];

export function FoundationOverview() {
  const { dataset, resetDemoData } = useDemoData();
  const issues = useMemo(() => validateDemoDataset(dataset), [dataset]);
  const counts = useMemo(() => enquiryStatusCounts(dataset), [dataset]);
  const pipeline = useMemo(() => openPipelineValue(dataset), [dataset]);

  return (
    <>
      <div className="page-heading">
        <h1>Frontend foundation</h1>
        <p>
          TO-01A establishes the scaffold, domain model, synthetic dataset and design tokens.
          Product screens arrive in TO-01B and the interactive workflow in TO-01C. Nothing here is          a live booking capability, and the market hypothesis remains unvalidated.
        </p>
      </div>

      <Panel
        title="Dataset"
        description={`Seeded for ${formatDate(dataset.meta.referenceDate)} · every record is synthetic`}
        actions={<button type="button" onClick={resetDemoData}>Reset demo data</button>}
      >
        <div className="stat-row">
          <div className="stat">
            <span className="stat__label">Open pipeline</span>
            <span className="stat__value">{formatMoney(pipeline)}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Pending</span>
            <span className="stat__value">{counts.pending}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Quoted</span>
            <span className="stat__value">{counts.quoted}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Converted</span>
            <span className="stat__value">{counts.converted}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr><th>Collection</th><th>Records</th></tr>
          </thead>
          <tbody>
            {COLLECTIONS.map(({ key, label }) => (
              <tr key={key}>
                <td>{label}</td>
                <td className="mono">{dataset[key].length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      <Panel
        title="Integrity"
        description="Referential, arithmetic and demo-data conventions are checked at runtime."
      >
        {issues.length === 0 ? (
          <p><Badge tone="positive">Dataset consistent</Badge></p>
        ) : (
          <ul className="issue-list">
            {issues.map((issue) => (
              <li key={`${issue.code}-${issue.entity}`}>
                {issue.code} · {issue.entity}: {issue.message}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Design tokens"
        description="Premium marine hospitality: deep navy, teal, warm sand, brass. System fonts only."
      >
        <div className="swatch-grid">
          {SWATCHES.map(({ token, label }) => (
            <div className="swatch" key={token}>
              <span className="swatch__chip" style={{ background: `var(${token})` }} />
              <span className="mono">{token}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div>
          {TYPE_SCALE.map(({ token, sample }) => (
            <div className="type-sample" key={token}>
              <span className="type-sample__meta">{token}</span>
              <span style={{ fontSize: `var(${token})` }}>{sample}</span>
            </div>
          ))}
        </div>

        <div className="scale-row">
          {SPACING.map((token) => (
            <span className="scale-block" key={token} title={token} style={{ width: `var(${token})`, height: '24px' }} />
          ))}
          {RADII.map((token) => (
            <span className="scale-block" key={token} title={token} style={{ width: '48px', height: '24px', borderRadius: `var(${token})` }} />
          ))}
        </div>

        <div className="badge-legend">
          {STATUS_GROUPS.map((group, index) =>
            Object.values(group).map((status) => (
              <Badge key={`${index}-${status.label}`} tone={status.tone}>{status.label}</Badge>
            )),
          )}
        </div>
      </Panel>
    </>
  );
}
