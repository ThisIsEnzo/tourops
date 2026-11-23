import type { ReactNode } from 'react';
import { Icon } from './Icon';

export interface CrumbView { readonly label: string; readonly onClick?: () => void }

export function PageHeader({ title, subtitle, crumbs, back, actions, badge }: {
  title: string; subtitle?: string; crumbs?: readonly CrumbView[];
  back?: { label: string; onClick: () => void }; actions?: ReactNode; badge?: ReactNode;
}): ReactNode {
  return (
    <header className="page-header">
      {crumbs ? (
        <nav className="crumbs" aria-label="Breadcrumb">
          {crumbs.map((crumb, index) => (
            <span className="crumb" key={`${crumb.label}-${index}`}>
              {crumb.onClick ? <button type="button" onClick={crumb.onClick}>{crumb.label}</button> : <span>{crumb.label}</span>}
              {index < crumbs.length - 1 ? <Icon name="chevron" size={12} /> : null}
            </span>
          ))}
        </nav>
      ) : null}
      <div className="page-header__row">
        <div className="page-header__text">
          {back ? (
            <button type="button" className="back-link" onClick={back.onClick}>
              <Icon name="back" size={14} /> {back.label}
            </button>
          ) : null}
          <h1 className="page-title">{title}{badge ? <span className="page-title__badge">{badge}</span> : null}</h1>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
        {actions ? <div className="page-actions">{actions}</div> : null}
      </div>
    </header>
  );
}