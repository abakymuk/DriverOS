export interface Driver {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: DriverStatus;
  licenseNumber: string;
  licenseExpiry: Date;
  carrierId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type DriverStatus = 'active' | 'inactive' | 'suspended' | 'on_trip';

export interface DriverAvailability {
  id: string;
  driverId: string;
  date: Date;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: AvailabilityStatus;
}

export type AvailabilityStatus = 'available' | 'busy' | 'off_duty' | 'sick_leave';

export interface DriverMetrics {
  driverId: string;
  totalTrips: number;
  completedTrips: number;
  failedTrips: number;
  averageTurnTime: number; // minutes
  totalDistance: number; // km
  rating: number; // 1-5
}
