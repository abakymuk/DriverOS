import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Driver, DriverAvailability, DriverMetrics } from '@prisma/client';
// Local UUID generator function
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Driver[]> {
    return this.prisma.driver.findMany({
      where: { deletedAt: null },
      include: {
        availability: {
          orderBy: { date: 'desc' },
        },
        metrics: true,
        truck: true,
        trips: {
          where: { deletedAt: null },
          include: {
            container: true,
            pickupSlot: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Driver> {
    const driver = await this.prisma.driver.findFirst({
      where: { id, deletedAt: null },
      include: {
        availability: {
          orderBy: { date: 'desc' },
        },
        metrics: true,
        truck: true,
        trips: {
          where: { deletedAt: null },
          include: {
            container: true,
            pickupSlot: true,
          },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return driver;
  }

  async findByCarrier(carrierId: string): Promise<Driver[]> {
    return this.prisma.driver.findMany({
      where: { carrierId, deletedAt: null },
      include: {
        availability: {
          orderBy: { date: 'desc' },
        },
        metrics: true,
        truck: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAvailable(): Promise<Driver[]> {
    return this.prisma.driver.findMany({
      where: { 
        deletedAt: null,
        status: 'ACTIVE',
      },
      include: {
        availability: {
          where: {
            date: new Date(),
            status: 'AVAILABLE',
          },
        },
        metrics: true,
        truck: {
          where: { status: 'AVAILABLE' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive(): Promise<Driver[]> {
    return this.prisma.driver.findMany({
      where: { 
        deletedAt: null,
        status: { in: ['ACTIVE', 'ON_TRIP'] },
      },
      include: {
        availability: {
          orderBy: { date: 'desc' },
        },
        metrics: true,
        truck: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
    const { availability, metrics, ...driverData } = createDriverDto;

    // Check if license number already exists
    const existingDriver = await this.prisma.driver.findFirst({
      where: { licenseNumber: driverData.licenseNumber, deletedAt: null },
    });

    if (existingDriver) {
      throw new ConflictException(`Driver with license number ${driverData.licenseNumber} already exists`);
    }

    return this.prisma.driver.create({
      data: {
        id: generateUUID(),
        ...driverData,
        availability: availability
          ? {
              create: availability.map(avail => ({
                id: generateUUID(),
                ...avail,
              })),
            }
          : undefined,
        metrics: metrics
          ? {
              create: {
                id: generateUUID(),
                ...metrics,
              },
            }
          : undefined,
      },
      include: {
        availability: true,
        metrics: true,
      },
    });
  }

  async update(id: string, updateDriverDto: UpdateDriverDto): Promise<Driver> {
    const { availability, metrics, ...driverData } = updateDriverDto;

    // Check if driver exists
    const existingDriver = await this.prisma.driver.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingDriver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    // Check if new license number conflicts with existing driver
    if (driverData.licenseNumber && driverData.licenseNumber !== existingDriver.licenseNumber) {
      const licenseConflict = await this.prisma.driver.findFirst({
        where: { licenseNumber: driverData.licenseNumber, deletedAt: null },
      });

      if (licenseConflict) {
        throw new ConflictException(`Driver with license number ${driverData.licenseNumber} already exists`);
      }
    }

    return this.prisma.driver.update({
      where: { id },
      data: {
        ...driverData,
        updatedAt: new Date(),
        availability: availability
          ? {
              deleteMany: {},
              create: availability.map(avail => ({
                id: generateUUID(),
                driverId: id,
                ...avail,
              })),
            }
          : undefined,
        metrics: metrics
          ? {
              create: {
                id: generateUUID(),
                totalTrips: metrics.totalTrips,
                completedTrips: metrics.completedTrips,
                failedTrips: metrics.failedTrips,
                averageTurnTime: metrics.averageTurnTime,
                totalDistance: metrics.totalDistance,
                rating: metrics.rating,
              },
            }
          : undefined,
      },
      include: {
        availability: true,
        metrics: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const driver = await this.prisma.driver.findFirst({
      where: { id, deletedAt: null },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    // Soft delete
    await this.prisma.driver.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async updateStatus(id: string, status: string): Promise<Driver> {
    const driver = await this.prisma.driver.findFirst({
      where: { id, deletedAt: null },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return this.prisma.driver.update({
      where: { id },
      data: {
        status: status as any,
        updatedAt: new Date(),
      },
      include: {
        availability: true,
        metrics: true,
      },
    });
  }

  async addAvailability(id: string, availabilityData: {
    date: string;
    startTime: string;
    endTime: string;
    status: string;
  }): Promise<DriverAvailability> {
    const driver = await this.prisma.driver.findFirst({
      where: { id, deletedAt: null },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return this.prisma.driverAvailability.create({
      data: {
        id: generateUUID(),
        driver: {
          connect: { id }
        },
        date: availabilityData.date,
        startTime: availabilityData.startTime,
        endTime: availabilityData.endTime,
        status: availabilityData.status as any,
      },
    });
  }

  async updateAvailability(id: string, availabilityId: string, availabilityData: {
    date?: string;
    startTime?: string;
    endTime?: string;
    status?: string;
  }): Promise<DriverAvailability> {
    const driver = await this.prisma.driver.findFirst({
      where: { id, deletedAt: null },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return this.prisma.driverAvailability.update({
      where: { id: availabilityId },
      data: {
        date: availabilityData.date,
        startTime: availabilityData.startTime,
        endTime: availabilityData.endTime,
        status: availabilityData.status as any,
        updatedAt: new Date(),
      },
    });
  }

  async updateMetrics(id: string, metricsData: {
    totalTrips?: number;
    completedTrips?: number;
    failedTrips?: number;
    averageTurnTime?: number;
    totalDistance?: number;
    rating?: number;
  }): Promise<DriverMetrics> {
    const driver = await this.prisma.driver.findFirst({
      where: { id, deletedAt: null },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }

    return this.prisma.driverMetrics.upsert({
      where: { driverId: id },
      create: {
        id: generateUUID(),
        driverId: id,
        totalTrips: metricsData.totalTrips,
        completedTrips: metricsData.completedTrips,
        failedTrips: metricsData.failedTrips,
        averageTurnTime: metricsData.averageTurnTime,
        totalDistance: metricsData.totalDistance,
        rating: metricsData.rating,
      },
      update: {
        totalTrips: metricsData.totalTrips,
        completedTrips: metricsData.completedTrips,
        failedTrips: metricsData.failedTrips,
        averageTurnTime: metricsData.averageTurnTime,
        totalDistance: metricsData.totalDistance,
        rating: metricsData.rating,
        updatedAt: new Date(),
      },
    });
  }

  async getStatistics(): Promise<{
    total: number;
    active: number;
    onTrip: number;
    suspended: number;
    inactive: number;
    averageRating: number;
  }> {
    const drivers = await this.prisma.driver.findMany({
      where: { deletedAt: null },
      include: {
        metrics: true,
      },
    });

    const total = drivers.length;
    const active = drivers.filter(d => d.status === 'ACTIVE').length;
    const onTrip = drivers.filter(d => d.status === 'ON_TRIP').length;
    const suspended = drivers.filter(d => d.status === 'SUSPENDED').length;
    const inactive = drivers.filter(d => d.status === 'INACTIVE').length;

    const ratings = drivers
      .map(d => d.metrics?.rating)
      .filter(r => r !== null && r !== undefined);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;

    return {
      total,
      active,
      onTrip,
      suspended,
      inactive,
      averageRating: Math.round(averageRating * 10) / 10,
    };
  }

  async getTopPerformers(limit: number = 10): Promise<Driver[]> {
    return this.prisma.driver.findMany({
      where: { deletedAt: null },
      include: {
        metrics: true,
        truck: true,
      },
      orderBy: {
        metrics: {
          rating: 'desc',
        },
      },
      take: limit,
    });
  }
}
