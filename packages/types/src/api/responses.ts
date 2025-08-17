// API Response types will be added here as needed
export interface TripResponse {
  id: string;
  driverId: string;
  containerId: string;
  status: string;
  eta?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ContainerResponse {
  id: string;
  cntrNo: string;
  type: string;
  line: string;
  status: string;
  readyAt?: string;
  terminalId: string;
}

export interface SlotResponse {
  id: string;
  terminalId: string;
  windowStart: string;
  windowEnd: string;
  capacity: number;
  booked: number;
  status: string;
}
