export interface Slot {
  id: string;
  terminalId: string;
  windowStart: Date;
  windowEnd: Date;
  capacity: number;
  booked: number;
  status: SlotStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type SlotStatus = 'available' | 'full' | 'closed' | 'maintenance';

export interface SlotBooking {
  id: string;
  slotId: string;
  tripId: string;
  driverId: string;
  containerId: string;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'failed';

export interface SlotConflict {
  slotId: string;
  conflictingTrips: string[];
  reason: ConflictReason;
  suggestedSlots?: string[];
}

export type ConflictReason = 
  | 'CAPACITY_EXCEEDED'
  | 'DRIVER_UNAVAILABLE'
  | 'CONTAINER_NOT_READY'
  | 'TERMINAL_CLOSED'
  | 'TIME_CONFLICT';
