import { DemoDataProvider, useDemoData } from './DemoDataProvider';
import { DemoDataBanner } from '../components/DemoDataBanner';
import { FoundationOverview } from '../features/foundation/FoundationOverview';
import { formatDate } from '../lib/datetime';

/**
 * TO-01A shell. Product screens (dashboard, enquiries, resources, operations)
 * arrive in TO-01B; this stage only proves the foundation is wired together.
 */
function Shell() {
  const { dataset } = useDemoData();
  const { meta } = dataset;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <span className="app-header__mark">TourOps</span>
          <span className="app-header__divider" aria-hidden="true" />
          <span className="app-header__operator">{meta.operatorName}</span>
        </div>
        <div className="app-header__meta">
          <span>{meta.homePort}</span>
          <span className="app-header__divider" aria-hidden="true" />
          <span>Demo date {formatDate(meta.referenceDate)}</span>
        </div>
      </header>

      <DemoDataBanner text={meta.disclaimer} />

      <main className="app-main">
        <FoundationOverview />
      </main>

      <footer className="app-footer">
        <span>Foundation v{meta.datasetVersion} · {meta.timezone}</span>
        <span>See docs/product/foundation-v0.1.md</span>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <DemoDataProvider>
      <Shell />
    </DemoDataProvider>
  );
}
