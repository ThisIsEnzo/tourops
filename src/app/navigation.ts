/** Typed, dependency-free hash navigation. Pure and unit-tested. */
import type { DemoDataset } from '../types/domain';
import { findById } from '../lib/selectors';

export type ResourceTab = 'vessels' | 'crew' | 'guides' | 'equipment';
export const RESOURCE_TABS: readonly ResourceTab[] = ['vessels', 'crew', 'guides', 'equipment'];
export const RESOURCE_TAB_LABEL: Record<ResourceTab, string> = {
  vessels: 'Vessels', crew: 'Crew', guides: 'Guides', equipment: 'Equipment',
};

export type Route =
  | { readonly screen: 'dashboard' }
  | { readonly screen: 'enquiries' }
  | { readonly screen: 'enquiry'; readonly id: string }
  | { readonly screen: 'quotes' }
  | { readonly screen: 'quote'; readonly id: string }
  | { readonly screen: 'bookings' }
  | { readonly screen: 'booking'; readonly id: string }
  | { readonly screen: 'departures' }
  | { readonly screen: 'departure'; readonly id: string }
  | { readonly screen: 'resources'; readonly tab: ResourceTab };

export type NavKey = 'dashboard' | 'enquiries' | 'quotes' | 'bookings' | 'departures' | 'resources';
export type EntityKind = 'enquiry' | 'quote' | 'booking' | 'departure' | 'resource';

export interface ScreenProps { readonly navigate: (route: Route) => void }
export interface DetailScreenProps extends ScreenProps { readonly id: string }
export interface NavItem { readonly key: NavKey; readonly label: string; readonly route: Route }

export const NAV_ITEMS: readonly NavItem[] = [
  { key: 'dashboard', label: 'Overview', route: { screen: 'dashboard' } },
  { key: 'enquiries', label: 'Enquiries', route: { screen: 'enquiries' } },
  { key: 'quotes', label: 'Quotes', route: { screen: 'quotes' } },
  { key: 'bookings', label: 'Bookings', route: { screen: 'bookings' } },
  { key: 'departures', label: 'Departures', route: { screen: 'departures' } },
  { key: 'resources', label: 'Resources', route: { screen: 'resources', tab: 'vessels' } },
];

export function routeForEntity(entity: EntityKind, id: string): Route {
  switch (entity) {
    case 'enquiry': return { screen: 'enquiry', id };
    case 'quote': return { screen: 'quote', id };
    case 'booking': return { screen: 'booking', id };
    case 'departure': return { screen: 'departure', id };
    case 'resource': return { screen: 'resources', tab: 'vessels' };
  }
}

export function routeToHash(route: Route): string {
  switch (route.screen) {
    case 'dashboard': return '#/overview';
    case 'enquiries': return '#/enquiries';
    case 'enquiry': return `#/enquiries/${encodeURIComponent(route.id)}`;
    case 'quotes': return '#/quotes';
    case 'quote': return `#/quotes/${encodeURIComponent(route.id)}`;
    case 'bookings': return '#/bookings';
    case 'booking': return `#/bookings/${encodeURIComponent(route.id)}`;
    case 'departures': return '#/departures';
    case 'departure': return `#/departures/${encodeURIComponent(route.id)}`;
    case 'resources': return `#/resources/${route.tab}`;
  }
}

export function parseRoute(hash: string): Route {
  const path = (hash.replace(/^#\/?/, '').split('?')[0] ?? '');
  const parts = path.split('/').filter((part) => part.length > 0).map((part) => decodeURIComponent(part));
  const head = parts[0] ?? 'overview';
  const id = parts[1];
  switch (head) {
    case 'enquiries': return id ? { screen: 'enquiry', id } : { screen: 'enquiries' };
    case 'quotes': return id ? { screen: 'quote', id } : { screen: 'quotes' };
    case 'bookings': return id ? { screen: 'booking', id } : { screen: 'bookings' };
    case 'departures': return id ? { screen: 'departure', id } : { screen: 'departures' };
    case 'resources': return { screen: 'resources', tab: RESOURCE_TABS.find((tab) => tab === id) ?? 'vessels' };
    default: return { screen: 'dashboard' };
  }
}

export function navKeyFor(route: Route): NavKey {
  switch (route.screen) {
    case 'enquiry':
    case 'enquiries': return 'enquiries';
    case 'quote':
    case 'quotes': return 'quotes';
    case 'booking':
    case 'bookings': return 'bookings';
    case 'departure':
    case 'departures': return 'departures';
    case 'resources': return 'resources';
    case 'dashboard': return 'dashboard';
  }
}

export interface Crumb { readonly label: string; readonly route: Route | null }

export function crumbsFor(route: Route, dataset: DemoDataset): readonly Crumb[] {
  const home: Crumb = { label: 'Overview', route: { screen: 'dashboard' } };
  switch (route.screen) {
    case 'dashboard': return [{ label: 'Overview', route: null }];
    case 'enquiries': return [home, { label: 'Enquiries', route: null }];
    case 'quotes': return [home, { label: 'Quotes', route: null }];
    case 'bookings': return [home, { label: 'Bookings', route: null }];
    case 'departures': return [home, { label: 'Departures', route: null }];
    case 'resources': return [home, { label: 'Resources', route: null }, { label: RESOURCE_TAB_LABEL[route.tab], route: null }];
    case 'enquiry': {
      const record = findById(dataset.enquiries, route.id);
      return [home, { label: 'Enquiries', route: { screen: 'enquiries' } }, { label: record ? record.reference : 'Not found', route: null }];
    }
    case 'quote': {
      const record = findById(dataset.quotes, route.id);
      return [home, { label: 'Quotes', route: { screen: 'quotes' } }, { label: record ? record.reference : 'Not found', route: null }];
    }
    case 'booking': {
      const record = findById(dataset.bookings, route.id);
      return [home, { label: 'Bookings', route: { screen: 'bookings' } }, { label: record ? record.reference : 'Not found', route: null }];
    }
    case 'departure': {
      const record = findById(dataset.departures, route.id);
      return [home, { label: 'Departures', route: { screen: 'departures' } }, { label: record ? record.reference : 'Not found', route: null }];
    }
  }
}