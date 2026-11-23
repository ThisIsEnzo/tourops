import type { ReactNode } from 'react';
import type { Route } from '../../app/navigation';
import { useDemoData } from '../../app/DemoDataProvider';
import { QuoteComposer } from './QuoteComposer';
import { QuoteActions } from './QuoteActions';
import { DepositForm } from './DepositForm';
import { useWalkthrough } from './WalkthroughProvider';

/**
 * Composition slot: extends the existing TO-01B detail screens with the Stage C
 * actions instead of duplicating them. Departure screens host their own panels.
 */
export function WorkflowAside({ route, navigate }: { route: Route; navigate: (next: Route) => void }): ReactNode {
  const { dataset } = useDemoData();
  const { start } = useWalkthrough();

  if (route.screen === 'enquiry') {
    const enquiry = dataset.enquiries.find((row) => row.id === route.id);
    if (!enquiry) return null;
    return (
      <div className="page wf-aside">
        <div className="wf-aside__bar">
          <span>Interactive walkthrough</span>
          <button type="button" className="wf-ghost" onClick={() => { start(enquiry.id); navigate({ screen: 'walkthrough' }); }}>
            Track this enquiry <Icon />
          </button>
        </div>
        <QuoteComposer key={enquiry.id} enquiryId={enquiry.id} navigate={navigate} />
      </div>
    );
  }

  if (route.screen === 'quote') {
    return <div className="page wf-aside"><QuoteActions quoteId={route.id} navigate={navigate} /></div>;
  }

  if (route.screen === 'booking') {
    return <div className="page wf-aside"><DepositForm bookingId={route.id} /></div>;
  }

  return null;
}

function Icon(): ReactNode {
  return <span aria-hidden="true">→</span>;
}