export type Office = 'ljubljana' | 'munich';

export interface OfficeConfig {
  id: Office;
  name: string;
  timezone: string;
  holidayCalendar: 'slovenian' | 'german';
}

export const offices: Record<Office, OfficeConfig> = {
  ljubljana: {
    id: 'ljubljana',
    name: 'Ljubljana',
    timezone: 'Europe/Ljubljana',
    holidayCalendar: 'slovenian',
  },
  munich: {
    id: 'munich',
    name: 'Munich',
    timezone: 'Europe/Berlin',
    holidayCalendar: 'german',
  },
};

export function getOfficeConfig(officeId: string): OfficeConfig | null {
  return offices[officeId as Office] || null;
}
