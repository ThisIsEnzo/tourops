import type { ReactNode } from 'react';
import { DemoDataProvider, useDemoData } from './DemoDataProvider';
import { AppShell } from './AppShell';
import { useNavigation } from './useNavigation';
import type { Route } from './navigation';
import { crumbsFor } from './navigation';
import { PageHeader } from '../components/ui/PageHeader';
import type { CrumbView } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { Panel } from '../components/ui/Panel';
import { DashboardScreen } from '../features/dashboard/DashboardScreen';
import { EnquiriesScreen } from '../features/enquiries/EnquiriesScreen';
import { EnquiryDetailScreen } from '../features/enquiries/EnquiryDetailScreen';
import { QuotesScreen } from '../features/quotes/QuotesScreen';
import { QuoteDetailScreen } from '../features/quotes/QuoteDetailScreen';
import { BookingsScreen } from '../features/bookings/BookingsScreen';
import { BookingDetailScreen } from '../features/bookings/BookingDetailScreen';
import { DeparturesScreen } from '../features/departures/DeparturesScreen';
import { DepartureDetailScreen } from '../features/departures/DepartureDetailScreen';
import { ResourcesScreen } from '../features/resources/ResourcesScreen';
import { WalkthroughProvider } from '../features/walkthrough/WalkthroughProvider';
import { WalkthroughScreen } from '../features/walkthrough/WalkthroughScreen';
import { WorkflowAside } from '../features/walkthrough/WorkflowAside';

/** Narrow once, then close over the narrowed constant — no type assertion needed. */
function toCrumbView(crumb: { label: string; route: Route | null }, navigate: (next: Route) => void): CrumbView {
  const target = crumb.route;
  return { label: crumb.label, onClick: target ? () => navigate(target) : undefined };
}

function MissingRecord({ route, navigate }: { route: Route; navigate: (next: Route) => void }): ReactNode {
  const { dataset } = useDemoData();
  return (
    <div className="page">
      <PageHeader title="Record not found" subtitle="This reference is not part of the synthetic demo dataset."
        crumbs={crumbsFor(route, dataset).map((crumb) => toCrumbView(crumb, navigate))} />
      <Panel title="Nothing to show">
        <EmptyState title="No such record" hint="Use the navigation to return to a populated screen."
          action={{ label: 'Back to overview', onClick: () => navigate({ screen: 'dashboard' }) }} />
      </Panel>
    </div>
  );
}

function screenFor(route: Route, navigate: (next: Route) => void): ReactNode {
  switch (route.screen) {
    case 'dashboard': return <DashboardScreen navigate={navigate} />;
    case 'walkthrough': return <WalkthroughScreen navigate={navigate} />;
    case 'enquiries': return <EnquiriesScreen navigate={navigate} />;
    case 'enquiry': return <EnquiryDetailScreen id={route.id} navigate={navigate} />;
    case 'quotes': return <QuotesScreen navigate={navigate} />;
    case 'quote': return <QuoteDetailScreen id={route.id} navigate={navigate} />;
    case 'bookings': return <BookingsScreen navigate={navigate} />;
    case 'booking': return <BookingDetailScreen id={route.id} navigate={navigate} />;
    case 'departures': return <DeparturesScreen navigate={navigate} />;
    case 'departure': return <DepartureDetailScreen id={route.id} navigate={navigate} />;
    case 'resources': return <ResourcesScreen tab={route.tab} navigate={navigate} />;
  }
}

function Router(): ReactNode {
  const { route, navigate } = useNavigation();
  return (
    <AppShell route={route} navigate={navigate}>
      {screenFor(route, navigate) ?? <MissingRecord route={route} navigate={navigate} />}
      <WorkflowAside route={route} navigate={navigate} />
    </AppShell>
  );
}

export function App(): ReactNode {
  return (
    <DemoDataProvider>
      <WalkthroughProvider>
        <Router />
      </WalkthroughProvider>
    </DemoDataProvider>
  );
}