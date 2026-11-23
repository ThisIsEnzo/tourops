/**
 * The single entry point to the synthetic dataset.
 * UI never imports individual data modules — it reads through `useDemoData()`.
 */
import type { DemoDataset } from '../types/domain';
import { DEMO_META } from './demoMeta';
import { experiences } from './experiences';
import { customers } from './customers';
import { enquiries } from './enquiries';
import { quotes } from './quotes';
import { bookings } from './bookings';
import { vessels } from './fleet';
import { crew, guides } from './crew';
import { equipment } from './equipment';
import { assignments, checklist, departures } from './operations';

/** Fresh envelope each call: the state container re-seeds with this factory. */
export function createDemoDataset(): DemoDataset {
  return {
    meta: DEMO_META,
    experiences,
    customers,
    enquiries,
    quotes,
    bookings,
    vessels,
    crew,
    guides,
    equipment,
    departures,
    assignments,
    checklist,
  };
}

export const demoDataset: DemoDataset = createDemoDataset();
