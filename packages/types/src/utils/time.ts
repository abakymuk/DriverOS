// Time utilities
export type TimeZone = string; // IANA timezone identifier
export type ISODateTime = string; // ISO 8601 format
export type ISODate = string; // YYYY-MM-DD format
export type ISOTime = string; // HH:mm:ss format

// Time range
export interface TimeRange {
  start: Date;
  end: Date;
}

// Time window for slots
export interface TimeWindow {
  start: ISOTime;
  end: ISOTime;
  duration: number; // minutes
}

// Time utilities
export const toISOString = (date: Date): ISODateTime => {
  return date.toISOString();
};

export const toISODate = (date: Date): ISODate => {
  return date.toISOString().split('T')[0] || '';
};

export const toISOTime = (date: Date): ISOTime => {
  const timePart = date.toISOString().split('T')[1];
  return timePart?.split('.')[0] || '00:00:00';
};

export const fromISOString = (isoString: ISODateTime): Date => {
  return new Date(isoString);
};

export const fromISODate = (isoDate: ISODate): Date => {
  return new Date(isoDate + 'T00:00:00.000Z');
};

export const fromISOTime = (isoTime: ISOTime, date: Date = new Date()): Date => {
  const parts = isoTime.split(':').map(Number);
  const [hours = 0, minutes = 0, seconds = 0] = parts;
  const result = new Date(date);
  result.setHours(hours, minutes, seconds, 0);
  return result;
};

// Timezone utilities
export const convertToTimezone = (date: Date, timezone: TimeZone): Date => {
  // In production, use a proper timezone library like date-fns-tz
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
};

export const isBusinessHours = (
  date: Date,
  timezone: TimeZone,
  businessHours: { start: ISOTime; end: ISOTime }
): boolean => {
  const localTime = convertToTimezone(date, timezone);
  const time = toISOTime(localTime);
  return time >= businessHours.start && time <= businessHours.end;
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + (minutes || 0) * 60 * 1000);
};

export const addHours = (date: Date, hours: number): Date => {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
};

export const addDays = (date: Date, days: number): Date => {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
};
