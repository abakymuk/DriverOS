export interface Terminal {
  id: string;
  name: string;
  code: string;
  capacity: number;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface TerminalSettings {
  terminalId: string;
  slotDuration: number; // minutes
  maxSlotsPerWindow: number;
  operatingHours: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
  closedDays: string[]; // ['sunday', 'saturday']
  specialRules?: {
    emptyReturns: boolean;
    dualOps: boolean;
  };
}

export type TerminalStatus = 'active' | 'inactive' | 'maintenance';
