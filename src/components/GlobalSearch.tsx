import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useDemoData } from '../app/DemoDataProvider';
import type { Route } from '../app/navigation';
import { routeForEntity } from '../app/navigation';
import { searchAll } from '../lib/filters';
import { Icon } from './ui/Icon';

export function GlobalSearch({ navigate }: { navigate: (route: Route) => void }): ReactNode {
  const { dataset } = useDemoData();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const hits = useMemo(() => searchAll(dataset, query, 6), [dataset, query]);

  const openHit = (index: number): void => {
    const hit = hits[index];
    if (!hit) return;
    navigate(routeForEntity(hit.entity, hit.id));
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="global-search"
      onBlur={(event) => {
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) setOpen(false);
      }}>
      <Icon name="search" />
      <input
        type="search" value={query} placeholder="Search references, guests, vessels…"
        aria-label="Search the demo dataset"
        onFocus={() => setOpen(true)}
        onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') { event.preventDefault(); openHit(0); }
          if (event.key === 'Escape') { setOpen(false); }
        }}
      />
      {open && query.trim() !== '' ? (
        <div className="search-results" role="listbox" aria-label="Search results">
          {hits.length === 0 ? (
            <p className="search-empty">No demo records match “{query}”.</p>
          ) : hits.map((hit, index) => (
            <button type="button" role="option" aria-selected={index === 0} className="search-hit"
              key={`${hit.entity}-${hit.id}`} onClick={() => openHit(index)}>
              <span className="search-hit__kind">{hit.entity}</span>
              <span className="search-hit__title">{hit.title}</span>
              <span className="search-hit__meta">{hit.subtitle}</span>
              <Icon name="arrow" size={14} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}