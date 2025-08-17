export interface Truck {
  id: string;
  driverId: string;
  plate: string;
  carrier: string;
  type: TruckType;
  capacity: number; // tons
  status: TruckStatus;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export type TruckType = 'dry_van' | 'reefer' | 'flatbed' | 'chassis';
export type TruckStatus = 'available' | 'in_use' | 'maintenance' | 'out_of_service';

export interface TruckLocation {
  id: string;
  truckId: string;
  lat: number;
  lng: number;
  timestamp: Date;
  speed?: number; // km/h
  heading?: number; // degrees
}
