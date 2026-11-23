import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useDemoData } from './DemoDataProvider';
import type { NavKey, Route } from './navigation';
import { NAV_ITEMS, navKeyFor, routeToHash } from './navigation';
import { dashboardMetrics } from '../lib/operations';
import { formatDate } from '../lib/datetime';
import { DemoDataBanner } from '../components/DemoDataBanner';
import { GlobalSearch } from '../components/GlobalSearch';
import { Icon } from '../components/ui/Icon';
import type { IconName } from '../components/ui/Icon';

const NAV_ICON: Record<NavKey, IconName> = {
  dashboard: 'overview', enquiries: 'enquiries', quotes: 'quotes',
  bookings: 'bookings', departures: 'departures', resources: 'resources',
};

export function AppShell({ route, navigate, children }: {
  route: Route; navigate: (route: Route) => void; children: ReactNode;
}): ReactNode {
  const { dataset, resetDemoData } = useDemoData();
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const metrics = useMemo(() => dashboardMetrics(dataset), [dataset]);
  const active = navKeyFor(route);

  useEffect(() => {
    setMenuOpen(false);
    mainRef.current?.scrollTo({ top: 0 });
  }, [route]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => { if (event.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const counts: Partial<Record<NavKey, number>> = {
    enquiries: metrics.pendingEnquiries,
    quotes: metrics.quotesAwaitingResponse,
    bookings: metrics.upcomingBookings,
    departures: metrics.upcomingDepartures,
  };

  return (
    <div className={menuOpen ? 'app-shell is-menu-open' : 'app-shell'}>
      <a className="skip-link" href="#main">Skip to content</a>
      <aside className="app-sidebar" aria-label="Primary">
        <div className="sidebar-brand">
          <span className="sidebar-brand__mark"><Icon name="anchor" size={18} /></span>
          <span className="sidebar-brand__text">
            <strong>TourOps</strong>
            <small>Operations workspace</small>
          </span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <a key={item.key} href={routeToHash(item.route)}
              className={active === item.key ? 'nav-item is-active' : 'nav-item'}
              aria-current={active === item.key ? 'page' : undefined}
              onClick={(event) => { event.preventDefault(); navigate(item.route); }}>
              <Icon name={NAV_ICON[item.key]} />
              <span>{item.label}</span>
              {counts[item.key] ? <span className="nav-count">{counts[item.key]}</span> : null}
            </a>
          ))}
        </nav>
        <div className="sidebar-foot">
          <p className="sidebar-foot__port">{dataset.meta.homePort}</p>
          <p className="sidebar-foot__date">Demo date · {formatDate(dataset.meta.referenceDate)}</p>
          <button type="button" className="sidebar-foot__reset" onClick={resetDemoData}>Reset demo data</button>
        </div>
      </aside>

      <button type="button" className="scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />

      <div className="app-body">
        <header className="app-header">
          <button type="button" className="menu-button" aria-label="Open navigation"
            aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}>
            <Icon name="menu" size={18} />
          </button>
          <div className="header-title">
            <strong>{dataset.meta.operatorName}</strong>
            <span>{dataset.meta.timezone} · 24h</span>
          </div>
          <GlobalSearch navigate={navigate} />
          <span className="demo-chip" title="Synthetic dataset, no live systems connected">Concept demo</span>
        </header>

        <DemoDataBanner text={dataset.meta.disclaimer} />

        <main className="app-main" id="main" ref={mainRef} tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}