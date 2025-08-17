// ID types
export type UUID = string;
export type ULID = string;

// Branded types for type safety
export type ContainerId = string & { readonly brand: unique symbol };
export type TripId = string & { readonly brand: unique symbol };
export type DriverId = string & { readonly brand: unique symbol };
export type TerminalId = string & { readonly brand: unique symbol };
export type SlotId = string & { readonly brand: unique symbol };
export type VesselId = string & { readonly brand: unique symbol };

// ID validation
export const isValidUUID = (id: string): id is UUID => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const isValidULID = (id: string): id is ULID => {
  const ulidRegex = /^[0-7][0-9A-HJKMNP-TV-Z]{25}$/;
  return ulidRegex.test(id);
};

// ID generation helpers
export const generateUUID = (): UUID => {
  return crypto.randomUUID();
};

export const generateULID = (): ULID => {
  // Simple ULID implementation - in production use a proper library
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return (timestamp + random).padEnd(26, '0').toUpperCase() as ULID;
};
