export interface Event {
  id: string;
  type: EventType;
  refId?: string; // container/trip/slot id
  meta?: Record<string, unknown>;
  createdAt: Date;
}

export type EventType = 
  | 'VESSEL_ARRIVAL'
  | 'CNTR_READY'
  | 'HOLD_ADDED'
  | 'HOLD_REMOVED'
  | 'TRIP_ASSIGNED'
  | 'TRIP_STARTED'
  | 'TRIP_COMPLETED'
  | 'TRIP_FAILED'
  | 'SLOT_BOOKED'
  | 'SLOT_CANCELLED'
  | 'DRIVER_AVAILABLE'
  | 'DRIVER_BUSY'
  | 'SYSTEM_ALERT'
  | 'METRICS_UPDATED';

export interface SystemAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  refId?: string;
  metadata?: Record<string, unknown>;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  createdAt: Date;
}

export type AlertType = 
  | 'CAPACITY_WARNING'
  | 'DELAY_ALERT'
  | 'SYSTEM_ERROR'
  | 'SECURITY_ALERT'
  | 'PERFORMANCE_ISSUE';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
