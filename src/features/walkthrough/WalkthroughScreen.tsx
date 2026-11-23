import { useState } from 'react';
import type { ReactNode } from 'react';
import { useDemoData } from '../../app/DemoDataProvider';
import type { Route, ScreenProps } from '../../app/navigation';
import { PageHeader } from '../../components/ui/PageHeader';
import { Panel } from '../../components/ui/Panel';
import { Badge } from '../../components/ui/Badge';
import { Icon } from '../../components/ui/Icon';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ENQUIRY_STATUS } from '../../lib/status';
import { formatDate } from '../../lib/datetime';
import { formatMoney } from '../../lib/money';
import { enquiryCustomer, enquiryExperience } from '../../lib/operations';
import { partySize } from '../../lib/selectors';
import { useWalkthrough } from './WalkthroughProvider';
import { QuoteComposer } from './QuoteComposer';
import { QuoteActions } from './QuoteActions';
import { DepositForm } from './DepositForm';
import { ResourceAssigner } from './ResourceAssigner';
import { PreparationBoard } from './PreparationBoard';
import { ReadinessPanel } from './ReadinessPanel';

/** Persistent, non-modal entry point and progress strip. */
export function WalkthroughStrip({ route, navigate }: { route: Route; navigate: (next: Route) => void }): ReactNode {
  const { active, model, modified, start, reset } = useWalkthrough();
  const [confirming, setConfirming] = useState(false);

  const requestReset = (): void => {
    if (modified) { setConfirming(true); return; }
    reset();
  };

  if (!active) {
    return (
      <div className="wf-strip is-idle">
        <span className="wf-strip__label"><Icon name="anchor" size={14} /> Interactive walkthrough</span>
        <span className="wf-strip__text">Enquiry → Quote → Booking → Deposit → Resources → Readiness, on synthetic data.</span>
        <button type="button" className="wf-primary wf-primary--sm" onClick={() => { start(); navigate({ screen: 'walkthrough' }); }}>
          Start scenario
        </button>
      </div>
    );
  }

  return (
    <div className="wf-strip">
      <span className="wf-strip__label">
        <Icon name="anchor" size={14} /> {model.completedCount}/{model.stages.length} · {model.current ? model.current.label : 'Complete'}
      </span>
      <span className="wf-strip__text">{model.current ? model.current.summary : 'Departure is ready to sail.'}</span>
      <div className="wf-strip__actions">
        {model.current?.route && route.screen !== 'walkthrough' ? (
          <button type="button" className="wf-primary wf-primary--sm"
            onClick={() => navigate({ screen: 'walkthrough' })}>
            Continue: {model.current.action}
          </button>
        ) : null}
        {route.screen !== 'walkthrough' ? (
          <button type="button" className="wf-ghost" onClick={() => navigate({ screen: 'walkthrough' })}>Walkthrough</button>
        ) : null}
        {confirming ? (
          <>
            <button type="button" className="wf-danger" onClick={() => { reset(); setConfirming(false); }}>Confirm reset</button>
            <button type="button" className="wf-ghost" onClick={() => setConfirming(false)}>Cancel</button>
          </>
        ) : (
          <button type="button" className="wf-ghost" onClick={requestReset}>Reset scenario</button>
        )}
      </div>
    </div>
  );
}

export function WalkthroughScreen({ navigate }: ScreenProps): ReactNode {
  const { dataset } = useDemoData();
  const { model, active, start, modified, reset } = useWalkthrough();
  const [confirming, setConfirming] = useState(false);
  const enquiry = model.enquiry;

  if (!enquiry) {
    return (
      <div className="page">
        <PageHeader title="Operations walkthrough" subtitle="Scenario enquiry is unavailable in this dataset." />
        <Panel title="Nothing to run"><EmptyState title="Scenario missing" hint="Reset the demo data to restore the seeded enquiry." /></Panel>
      </div>
    );
  }

  const customer = enquiryCustomer(dataset, enquiry);
  const experience = enquiryExperience(dataset, enquiry);

  const stageBody = (): ReactNode => {
    if (model.isComplete) {
      return <ReadinessPanel departureId={model.departure?.id ?? ''} />;
    }
    const key = model.current?.key;
    if (key === 'enquiry') return <QuoteComposer key={enquiry.id} enquiryId={enquiry.id} navigate={navigate} />;
    if (key === 'quote' && model.quote) return <QuoteActions quoteId={model.quote.id} navigate={navigate} />;
    if (key === 'booking' && model.quote) return <QuoteActions quoteId={model.quote.id} navigate={navigate} />;
    if (key === 'deposit' && model.booking) return <DepositForm bookingId={model.booking.id} />;
    if (key === 'resources' && model.departure) return <ResourceAssigner departureId={model.departure.id} />;
    if (key === 'preparation' && model.departure) return <PreparationBoard departureId={model.departure.id} />;
    if (model.departure) return <ReadinessPanel departureId={model.departure.id} />;
    return <Panel title="Next step"><EmptyState title="Continue the pipeline" hint="Accept the quote to create a booking and departure." /></Panel>;
  };

  return (
    <div className="page">
      <PageHeader
        title="Operations walkthrough"
        subtitle="One fictional guest request, taken from enquiry to a departure that is ready to sail."
        crumbs={[{ label: 'Overview', onClick: () => navigate({ screen: 'dashboard' }) }, { label: 'Walkthrough' }]}
        badge={<Badge tone={model.isComplete ? 'positive' : 'info'}>{model.completedCount}/{model.stages.length} stages</Badge>}
        actions={
          <>
            {!active ? <button type="button" className="wf-primary" onClick={() => start(enquiry.id)}>Start scenario</button> : null}
            {confirming ? (
              <>
                <button type="button" className="wf-danger" onClick={() => { reset(); setConfirming(false); }}>Confirm reset</button>
                <button type="button" className="wf-ghost" onClick={() => setConfirming(false)}>Cancel</button>
              </>
            ) : (
              <button type="button" className="wf-ghost" onClick={() => (modified ? setConfirming(true) : reset())}>Reset scenario</button>
            )}
          </>
        }
      />

      <Panel title="Scenario" description="Synthetic guest, synthetic vessel, simulated money">
        <div className="wf-scenario">
          <div><span>Guest</span><strong>{customer?.displayName ?? '—'}</strong><small>{customer?.contactName ?? ''}</small></div>
          <div><span>Experience</span><strong>{experience?.name ?? '—'}</strong><small>{formatDate(enquiry.preferredDate)}</small></div>
          <div><span>Party</span><strong>{partySize(enquiry.party)} guests</strong><small>{enquiry.party.adults} adults / {enquiry.party.children} children</small></div>
          <div><span>Enquiry</span><strong className="mono">{enquiry.reference}</strong><StatusBadge presentation={ENQUIRY_STATUS[enquiry.status]} /></div>
          <div><span>Value</span><strong className="mono">{enquiry.estimatedValue ? formatMoney(enquiry.estimatedValue) : '—'}</strong><small>estimate</small></div>
        </div>
        <div className="wf-actions">
          <button type="button" className="wf-ghost" onClick={() => navigate({ screen: 'enquiry', id: enquiry.id })}>Open enquiry</button>
          {model.quote ? <button type="button" className="wf-ghost" onClick={() => navigate({ screen: 'quote', id: model.quote!.id })}>Open quote</button> : null}
          {model.booking ? <button type="button" className="wf-ghost" onClick={() => navigate({ screen: 'booking', id: model.booking!.id })}>Open booking</button> : null}
          {model.departure ? <button type="button" className="wf-ghost" onClick={() => navigate({ screen: 'departure', id: model.departure!.id })}>Open run sheet</button> : null}
        </div>
      </Panel>

      <ol className="wf-rail">
        {model.stages.map((stage, index) => (
          <li key={stage.key} className={`wf-rail__step is-${stage.status}`}>
            <button type="button" disabled={!stage.route}
              onClick={() => { if (stage.route) navigate(stage.route); }}>
              <span className="wf-rail__index">{stage.status === 'complete' ? <Icon name="check" size={12} /> : index + 1}</span>
              <span className="wf-rail__label">{stage.label}</span>
              <span className="wf-rail__status">{stage.status}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="wf-current">
        <p className="wf-current__hint">
          <Icon name="arrow" size={14} />
          {model.isComplete ? 'Scenario complete — every readiness requirement is satisfied.' : `${model.current?.label}: ${model.current?.summary}`}
        </p>
        {stageBody()}
      </div>

      {model.departure && !model.isComplete ? <ReadinessPanel departureId={model.departure.id} /> : null}
    </div>
  );
}