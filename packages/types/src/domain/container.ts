export interface Container {
  id: string;
  cntrNo: string; // ISO 6346 format
  type: ContainerType;
  line: string; // CMA, MSC, MAE...
  readyAt?: Date;
  hold: boolean;
  status: ContainerStatus;
  terminalId: string;
  vesselId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type ContainerType = '20GP' | '40HC' | '40GP' | '45HC';
export type ContainerStatus = 'NOT_READY' | 'READY' | 'PICKED' | 'DELIVERED' | 'HOLD';

export interface ContainerHold {
  id: string;
  containerId: string;
  reason: HoldReason;
  description?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export type HoldReason = 
  | 'CUSTOMS_HOLD'
  | 'DOCUMENTATION'
  | 'CHASSIS_SHORTAGE'
  | 'GATE_BLOCKED'
  | 'WEATHER'
  | 'MAINTENANCE'
  | 'OTHER';
