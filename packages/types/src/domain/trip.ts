export interface Trip {
  id: string;
  driverId: string;
  containerId: string;
  pickupSlotId?: string;
  returnEmpty: boolean;
  status: TripStatus;
  eta?: Date;
  startedAt?: Date;
  completedAt?: Date;
  turnMinutes?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type TripStatus = 
  | 'ASSIGNED'
  | 'STARTED'
  | 'EN_ROUTE'
  | 'GATE_READY'
  | 'AT_GATE'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface TripMetrics {
  tripId: string;
  totalDistance: number; // km
  estimatedDuration: number; // minutes
  actualDuration?: number; // minutes
  fuelConsumption?: number; // liters
  carbonFootprint?: number; // kg CO2
}

export interface TripEvent {
  id: string;
  tripId: string;
  type: TripEventType;
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
  };
  metadata?: Record<string, unknown>;
}

export type TripEventType = 
  | 'TRIP_STARTED'
  | 'ETA_UPDATED'
  | 'ARRIVED_AT_GATE'
  | 'GATE_PROCESSING'
  | 'CONTAINER_PICKED'
  | 'TRIP_COMPLETED'
  | 'TRIP_FAILED'
  | 'DELAY_DETECTED';
