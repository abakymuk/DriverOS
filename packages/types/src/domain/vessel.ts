export interface Vessel {
  id: string;
  name: string;
  eta: Date;
  terminalId: string;
  status: VesselStatus;
  containerCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type VesselStatus = 'arriving' | 'berthed' | 'discharging' | 'departed';

export interface VesselSchedule {
  id: string;
  vesselId: string;
  terminalId: string;
  eta: Date;
  etd: Date;
  actualArrival?: Date;
  actualDeparture?: Date;
  status: ScheduleStatus;
}

export type ScheduleStatus = 'scheduled' | 'arrived' | 'departed' | 'delayed' | 'cancelled';
