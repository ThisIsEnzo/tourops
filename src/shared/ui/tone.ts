/** Generic status-presentation contract. Domain modules own status wording and mapping. */
export type StatusTone = 'neutral' | 'info' | 'positive' | 'attention' | 'critical' | 'muted';
export interface StatusPresentation { readonly label: string; readonly tone: StatusTone; }
