/** Fictional customers. Names, numbers and mailboxes are invented (see demoMeta.ts). */
import type { Customer } from '../types/domain';

export const customers: readonly Customer[] = [
  {
    id: 'demo-cus-001', displayName: 'Suksai Family Group', contactName: 'Rattana Suksai',
    preferredChannel: 'line', phone: '+66 80 000 0101', email: 'rattana.suksai@example.com',
    preferredLanguage: 'th', repeatGuest: true,
    notes: 'Books a family charter every December. Prefers Thai-speaking crew.',
  },
  {
    id: 'demo-cus-002', displayName: 'Nordwind Reisen (agent)', contactName: 'Lena Hartmann',
    preferredChannel: 'email', phone: '+66 80 000 0102', email: 'lena.hartmann@example.org',
    preferredLanguage: 'de', repeatGuest: true,
    notes: 'Fictional inbound agent. Sends group blocks 10–14 days ahead, pays by transfer.',
  },
  {
    id: 'demo-cus-003', displayName: 'Petrov Party', contactName: 'Ivan Petrov',
    preferredChannel: 'whatsapp', phone: '+66 80 000 0103', email: 'ivan.petrov@example.com',
    preferredLanguage: 'ru', repeatGuest: false,
    notes: 'Price-sensitive. Asked for a Russian-speaking guide last time.',
  },
  {
    id: 'demo-cus-004', displayName: 'Wei Trading Co. (corporate)', contactName: 'Chen Wei',
    preferredChannel: 'email', phone: '+66 80 000 0104', email: 'chen.wei@example.org',
    preferredLanguage: 'zh', repeatGuest: false,
    notes: 'Corporate offsite. Requires an invoice and a fixed return time.',
  },
  {
    id: 'demo-cus-005', displayName: 'Thongchai Birthday Party', contactName: 'Somsak Thongchai',
    preferredChannel: 'phone', phone: '+66 80 000 0105', email: 'somsak.thongchai@example.com',
    preferredLanguage: 'th', repeatGuest: false,
    notes: 'Enquired about sport fishing; went quiet after the quote was sent.',
  },
  {
    id: 'demo-cus-006', displayName: 'Carter Group', contactName: 'Emily Carter',
    preferredChannel: 'website', phone: '+66 80 000 0106', email: 'emily.carter@example.com',
    preferredLanguage: 'en', repeatGuest: false,
    notes: 'Website form enquiry for a Koh Samet transfer in December.',
  },
];
