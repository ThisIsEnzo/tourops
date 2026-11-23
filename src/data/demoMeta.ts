/**
 * Demo-data conventions. EVERY record under src/data is invented.
 *
 * Rules enforced by `validateDemoDataset`:
 * 1. every entity id starts with `demo-`;
 * 2. every email uses a reserved example domain (RFC 2606);
 * 3. every phone number uses the fictional block below;
 * 4. the dataset is flagged `synthetic: true`.
 *
 * Never import real operator, guest or passenger data into this folder.
 */
import type { DemoMeta } from '../types/domain';

export const DEMO_ID_PREFIX = 'demo-';
export const DEMO_EMAIL_DOMAINS = ['example.com', 'example.org', 'example.net'] as const;
/** Deliberately synthetic-looking block: +66 80 000 0xxx. Fictional. */
export const DEMO_PHONE_PREFIX = '+66 80 000 0';

export const DEMO_META: DemoMeta = {
  operatorName: 'Siam Blue Charters',
  homePort: 'Ocean Marina Pattaya — Berth C-12',
  timezone: 'Asia/Bangkok',
  currency: 'THB',
  referenceDate: '2026-11-23',
  datasetVersion: '0.1.0',
  synthetic: true,
  disclaimer:
    'Concept demo with synthetic data for a fictional operator. Not a live booking system: ' +
    'no real customers, no live availability, no messaging integrations and no payment processing.',
};
