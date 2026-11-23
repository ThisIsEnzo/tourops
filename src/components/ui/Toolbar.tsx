import type { ReactNode } from 'react';
import { Icon } from './Icon';
import type { Option } from '../../lib/filters';

export function Toolbar({ query, onQuery, placeholder, children }: {
  query: string; onQuery: (value: string) => void; placeholder: string; children?: ReactNode;
}): ReactNode {
  return (
    <div className="toolbar">
      <div className="search-field">
        <Icon name="search" />
        <input type="search" value={query} placeholder={placeholder} aria-label={placeholder}
          onChange={(event) => onQuery(event.target.value)} />
        {query !== '' ? (
          <button type="button" className="search-clear" aria-label="Clear search" onClick={() => onQuery('')}>
            <Icon name="close" size={14} />
          </button>
        ) : null}
      </div>
      <div className="toolbar__filters">{children}</div>
    </div>
  );
}

export function FilterSelect<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: readonly Option<T>[]; onChange: (value: T) => void;
}): ReactNode {
  return (
    <label className="filter-select">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}