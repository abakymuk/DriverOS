import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto, UpdateTripDto } from './dto';
import { Trip, TripMetrics, TripEvent } from '@prisma/client';
import { generateUUID } from '@driveros/types';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Trip[]> {
    return this.prisma.trip.findMany({
      where: { deletedAt: null },
      include: {
        driver: true,
        container: {
          include: {
            terminal: true,
            vessel: true,
          },
        },
        pickupSlot: true,
        metrics: true,
        events: {
          orderBy: { timestamp: 'desc' },
        },
        bookings: {
          include: {
            slot: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Trip> {
    const trip = await this.prisma.trip.findFirst({
      where: { id, deletedAt: null },
      include: {
        driver: true,
        container: {
          include: {
            terminal: true,
            vessel: true,
          },
        },
        pickupSlot: true,
        metrics: true,
        events: {
          orderBy: { timestamp: 'desc' },
        },
        bookings: {
          include: {
            slot: true,
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return trip;
  }

  async findByDriver(driverId: string): Promise<Trip[]> {
    return this.prisma.trip.findMany({
      where: { driverId, deletedAt: null },
      include: {
        driver: true,
        container: {
          include: {
            terminal: true,
            vessel: true,
          },
        },
        pickupSlot: true,
        metrics: true,
        events: {
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByContainer(containerId: string): Promise<Trip[]> {
    return this.prisma.trip.findMany({
      where: { containerId, deletedAt: null },
      include: {
        driver: true,
        container: {
          include: {
            terminal: true,
            vessel: true,
          },
        },
        pickupSlot: true,
        metrics: true,
        events: {
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive(): Promise<Trip[]> {
    return this.prisma.trip.findMany({
      where: { 
        deletedAt: null,
        status: { in: ['ASSIGNED', 'STARTED', 'EN_ROUTE', 'GATE_READY', 'AT_GATE', 'PROCESSING'] },
      },
      include: {
        driver: true,
        container: {
          include: {
            terminal: true,
            vessel: true,
          },
        },
        pickupSlot: true,
        metrics: true,
        events: {
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCompleted(): Promise<Trip[]> {
    return this.prisma.trip.findMany({
      where: { 
        deletedAt: null,
        status: { in: ['COMPLETED', 'FAILED', 'CANCELLED'] },
      },
      include: {
        driver: true,
        container: {
          include: {
            terminal: true,
            vessel: true,
          },
        },
        pickupSlot: true,
        metrics: true,
        events: {
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { completedAt: 'desc' },
    });
  }

  async create(createTripDto: CreateTripDto): Promise<Trip> {
    const { metrics, events, ...tripData } = createTripDto;

    // Check if driver exists
    const driver = await this.prisma.driver.findFirst({
      where: { id: tripData.driverId, deletedAt: null },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${tripData.driverId} not found`);
    }

    // Check if container exists
    const container = await this.prisma.container.findFirst({
      where: { id: tripData.containerId, deletedAt: null },
    });

    if (!container) {
      throw new NotFoundException(`Container with ID ${tripData.containerId} not found`);
    }

    // Check if pickup slot exists if provided
    if (tripData.pickupSlotId) {
      const slot = await this.prisma.slot.findFirst({
        where: { id: tripData.pickupSlotId, deletedAt: null },
      });

      if (!slot) {
        throw new NotFoundException(`Slot with ID ${tripData.pickupSlotId} not found`);
      }
    }

    return this.prisma.trip.create({
      data: {
        id: generateUUID(),
        ...tripData,
        metrics: metrics
          ? {
              create: {
                id: generateUUID(),
                ...metrics,
              },
            }
          : undefined,
        events: events
          ? {
              create: events.map(event => ({
                id: generateUUID(),
                ...event,
              })),
            }
          : undefined,
      },
      include: {
        driver: true,
        container: {
          include: {
            terminal: true,
            vessel: true,
          },
        },
        pickupSlot: true,
        metrics: true,
        events: true,
      },
    });
  }

  async update(id: string, updateTripDto: UpdateTripDto): Promise<Trip> {
    const { metrics, events, ...tripData } = updateTripDto;

    // Check if trip exists
    const existingTrip = await this.prisma.trip.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingTrip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    // Check if driver exists if driverId is being updated
    if (tripData.driverId && tripData.driverId !== existingTrip.driverId) {
      const driver = await this.prisma.driver.findFirst({
        where: { id: tripData.driverId, deletedAt: null },
      });

      if (!driver) {
        throw new NotFoundException(`Driver with ID ${tripData.driverId} not found`);
      }
    }

    // Check if container exists if containerId is being updated
    if (tripData.containerId && tripData.containerId !== existingTrip.containerId) {
      const container = await this.prisma.container.findFirst({
        where: { id: tripData.containerId, deletedAt: null },
      });

      if (!container) {
        throw new NotFoundException(`Container with ID ${tripData.containerId} not found`);
      }
    }

    // Check if pickup slot exists if pickupSlotId is being updated
    if (tripData.pickupSlotId && tripData.pickupSlotId !== existingTrip.pickupSlotId) {
      const slot = await this.prisma.slot.findFirst({
        where: { id: tripData.pickupSlotId, deletedAt: null },
      });

      if (!slot) {
        throw new NotFoundException(`Slot with ID ${tripData.pickupSlotId} not found`);
      }
    }

    return this.prisma.trip.update({
      where: { id },
      data: {
        ...tripData,
        updatedAt: new Date(),
        metrics: metrics
          ? {
              upsert: {
                create: {
                  id: generateUUID(),
                  tripId: id,
                  ...metrics,
                },
                update: {
                  ...metrics,
                  updatedAt: new Date(),
                },
              },
            }
          : undefined,
        events: events
          ? {
              deleteMany: {},
              create: events.map(event => ({
                id: generateUUID(),
                tripId: id,
                ...event,
              })),
            }
          : undefined,
      },
      include: {
        driver: true,
        container: {
          include: {
            terminal: true,
            vessel: true,
          },
        },
        pickupSlot: true,
        metrics: true,
        events: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const trip = await this.prisma.trip.findFirst({
      where: { id, deletedAt: null },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    // Soft delete
    await this.prisma.trip.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async updateStatus(id: string, status: string): Promise<Trip> {
    const trip = await this.prisma.trip.findFirst({
      where: { id, deletedAt: null },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    const updateData: any = {
      status: status as any,
      updatedAt: new Date(),
    };

    // Set started_at when trip starts
    if (status === 'STARTED' && !trip.startedAt) {
      updateData.startedAt = new Date();
    }

    // Set completed_at when trip completes
    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(status) && !trip.completedAt) {
      updateData.completedAt = new Date();
    }

    return this.prisma.trip.update({
      where: { id },
      data: updateData,
      include: {
        driver: true,
        container: {
          include: {
            terminal: true,
            vessel: true,
          },
        },
        pickupSlot: true,
        metrics: true,
        events: true,
      },
    });
  }

  async addEvent(id: string, eventData: {
    type: string;
    timestamp?: string;
    location?: any;
    metadata?: any;
  }): Promise<TripEvent> {
    const trip = await this.prisma.trip.findFirst({
      where: { id, deletedAt: null },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return this.prisma.tripEvent.create({
      data: {
        id: generateUUID(),
        tripId: id,
        type: eventData.type as any,
        timestamp: eventData.timestamp ? new Date(eventData.timestamp) : new Date(),
        location: eventData.location,
        metadata: eventData.metadata,
      },
    });
  }

  async updateMetrics(id: string, metricsData: {
    totalDistance?: number;
    estimatedDuration?: number;
    actualDuration?: number;
    fuelConsumption?: number;
    carbonFootprint?: number;
  }): Promise<TripMetrics> {
    const trip = await this.prisma.trip.findFirst({
      where: { id, deletedAt: null },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return this.prisma.tripMetrics.upsert({
      where: { tripId: id },
      create: {
        id: generateUUID(),
        tripId: id,
        ...metricsData,
      },
      update: {
        ...metricsData,
        updatedAt: new Date(),
      },
    });
  }

  async calculateTurnTime(id: string): Promise<number | null> {
    const trip = await this.prisma.trip.findFirst({
      where: { id, deletedAt: null },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    if (!trip.startedAt || !trip.completedAt) {
      return null;
    }

    const turnTimeMs = trip.completedAt.getTime() - trip.startedAt.getTime();
    return Math.round(turnTimeMs / (1000 * 60)); // Convert to minutes
  }

  async getStatistics(): Promise<{
    total: number;
    assigned: number;
    inProgress: number;
    completed: number;
    failed: number;
    cancelled: number;
    averageTurnTime: number;
  }> {
    const trips = await this.prisma.trip.findMany({
      where: { deletedAt: null },
    });

    const total = trips.length;
    const assigned = trips.filter(t => t.status === 'ASSIGNED').length;
    const inProgress = trips.filter(t => ['STARTED', 'EN_ROUTE', 'GATE_READY', 'AT_GATE', 'PROCESSING'].includes(t.status)).length;
    const completed = trips.filter(t => t.status === 'COMPLETED').length;
    const failed = trips.filter(t => t.status === 'FAILED').length;
    const cancelled = trips.filter(t => t.status === 'CANCELLED').length;

    const turnTimes = trips
      .filter(t => t.startedAt && t.completedAt)
      .map(t => {
        const turnTimeMs = t.completedAt!.getTime() - t.startedAt!.getTime();
        return Math.round(turnTimeMs / (1000 * 60));
      });

    const averageTurnTime = turnTimes.length > 0 
      ? Math.round(turnTimes.reduce((sum, time) => sum + time, 0) / turnTimes.length)
      : 0;

    return {
      total,
      assigned,
      inProgress,
      completed,
      failed,
      cancelled,
      averageTurnTime,
    };
  }

  async getDriverPerformance(driverId: string): Promise<{
    totalTrips: number;
    completedTrips: number;
    failedTrips: number;
    averageTurnTime: number;
    totalDistance: number;
  }> {
    const trips = await this.prisma.trip.findMany({
      where: { 
        driverId,
        deletedAt: null,
      },
      include: {
        metrics: true,
      },
    });

    const totalTrips = trips.length;
    const completedTrips = trips.filter(t => t.status === 'COMPLETED').length;
    const failedTrips = trips.filter(t => t.status === 'FAILED').length;

    const turnTimes = trips
      .filter(t => t.startedAt && t.completedAt)
      .map(t => {
        const turnTimeMs = t.completedAt!.getTime() - t.startedAt!.getTime();
        return Math.round(turnTimeMs / (1000 * 60));
      });

    const averageTurnTime = turnTimes.length > 0 
      ? Math.round(turnTimes.reduce((sum, time) => sum + time, 0) / turnTimes.length)
      : 0;

    const totalDistance = trips
      .map(t => t.metrics?.totalDistance || 0)
      .reduce((sum, distance) => sum + distance, 0);

    return {
      totalTrips,
      completedTrips,
      failedTrips,
      averageTurnTime,
      totalDistance,
    };
  }
}
