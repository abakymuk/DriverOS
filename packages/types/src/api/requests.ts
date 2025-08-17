// API Request types will be added here as needed
export interface CreateTripRequest {
  driverId: string;
  containerId: string;
  pickupSlotId?: string;
  returnEmpty?: boolean;
}

export interface UpdateTripRequest {
  status?: string;
  eta?: string;
}

export interface BookSlotRequest {
  slotId: string;
  tripId: string;
  driverId: string;
  containerId: string;
}

export interface CreateContainerRequest {
  cntrNo: string;
  type: string;
  line: string;
  terminalId: string;
  vesselId?: string;
}
