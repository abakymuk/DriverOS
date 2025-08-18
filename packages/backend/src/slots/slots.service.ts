import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSlotDto } from './dto/create-slot.dto';
import { UpdateSlotDto } from './dto/update-slot.dto';
import { Slot, SlotBooking } from '@prisma/client';
// Local UUID generator function
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

@Injectable()
export class SlotsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Slot[]> {
    return this.prisma.slot.findMany({
      where: { deletedAt: null },
      include: {
        terminal: true,
        bookings: {
          include: {
            trip: {
              include: {
                driver: true,
                container: true,
              },
            },
          },
        },
      },
      orderBy: { windowStart: 'asc' },
    });
  }

  async findOne(id: string): Promise<Slot> {
    const slot = await this.prisma.slot.findFirst({
      where: { id, deletedAt: null },
      include: {
        terminal: true,
        bookings: {
          include: {
            trip: {
              include: {
                driver: true,
                container: true,
              },
            },
          },
        },
      },
    });

    if (!slot) {
      throw new NotFoundException(`Slot with ID ${id} not found`);
    }

    return slot;
  }

  async findByTerminal(terminalId: string): Promise<Slot[]> {
    return this.prisma.slot.findMany({
      where: { terminalId, deletedAt: null },
      include: {
        terminal: true,
        bookings: {
          include: {
            trip: {
              include: {
                driver: true,
                container: true,
              },
            },
          },
        },
      },
      orderBy: { windowStart: 'asc' },
    });
  }

  async findAvailable(terminalId?: string, date?: Date): Promise<Slot[]> {
    const whereClause: any = {
      deletedAt: null,
      status: 'AVAILABLE',
    };

    if (terminalId) {
      whereClause.terminalId = terminalId;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.windowStart = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    return this.prisma.slot.findMany({
      where: whereClause,
      include: {
        terminal: true,
        bookings: {
          include: {
            trip: {
              include: {
                driver: true,
                container: true,
              },
            },
          },
        },
      },
      orderBy: { windowStart: 'asc' },
    });
  }

  async findUpcoming(terminalId?: string, days: number = 7): Promise<Slot[]> {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + days);

    const whereClause: any = {
      deletedAt: null,
      windowStart: {
        gte: now,
        lte: endDate,
      },
    };

    if (terminalId) {
      whereClause.terminalId = terminalId;
    }

    return this.prisma.slot.findMany({
      where: whereClause,
      include: {
        terminal: true,
        bookings: {
          include: {
            trip: {
              include: {
                driver: true,
                container: true,
              },
            },
          },
        },
      },
      orderBy: { windowStart: 'asc' },
    });
  }

  async create(createSlotDto: CreateSlotDto): Promise<Slot> {
    // Check if terminal exists
    const terminal = await this.prisma.terminal.findFirst({
      where: { id: createSlotDto.terminalId, deletedAt: null },
    });

    if (!terminal) {
      throw new NotFoundException(`Terminal with ID ${createSlotDto.terminalId} not found`);
    }

    // Check if slot already exists for this terminal and time window
    const existingSlot = await this.prisma.slot.findFirst({
      where: {
        terminalId: createSlotDto.terminalId,
        windowStart: createSlotDto.windowStart,
        windowEnd: createSlotDto.windowEnd,
        deletedAt: null,
      },
    });

    if (existingSlot) {
      throw new ConflictException(`Slot already exists for this terminal and time window`);
    }

    return this.prisma.slot.create({
      data: {
        id: generateUUID(),
        ...createSlotDto,
      },
      include: {
        terminal: true,
      },
    });
  }

  async update(id: string, updateSlotDto: UpdateSlotDto): Promise<Slot> {
    // Check if slot exists
    const existingSlot = await this.prisma.slot.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingSlot) {
      throw new NotFoundException(`Slot with ID ${id} not found`);
    }

    // Check if terminal exists if terminalId is being updated
    if (updateSlotDto.terminalId && updateSlotDto.terminalId !== existingSlot.terminalId) {
      const terminal = await this.prisma.terminal.findFirst({
        where: { id: updateSlotDto.terminalId, deletedAt: null },
      });

      if (!terminal) {
        throw new NotFoundException(`Terminal with ID ${updateSlotDto.terminalId} not found`);
      }
    }

    // Check if new time window conflicts with existing slot
    if (updateSlotDto.windowStart && updateSlotDto.windowEnd) {
      const conflictingSlot = await this.prisma.slot.findFirst({
        where: {
          terminalId: updateSlotDto.terminalId || existingSlot.terminalId,
          windowStart: updateSlotDto.windowStart,
          windowEnd: updateSlotDto.windowEnd,
          id: { not: id },
          deletedAt: null,
        },
      });

      if (conflictingSlot) {
        throw new ConflictException(`Slot already exists for this terminal and time window`);
      }
    }

    return this.prisma.slot.update({
      where: { id },
      data: {
        ...updateSlotDto,
        updatedAt: new Date(),
      },
      include: {
        terminal: true,
        bookings: {
          include: {
            trip: {
              include: {
                driver: true,
                container: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    const slot = await this.prisma.slot.findFirst({
      where: { id, deletedAt: null },
    });

    if (!slot) {
      throw new NotFoundException(`Slot with ID ${id} not found`);
    }

    // Check if slot has any bookings
    const bookings = await this.prisma.slotBooking.findMany({
      where: { slotId: id },
    });

    if (bookings.length > 0) {
      throw new ConflictException(`Cannot delete slot with existing bookings`);
    }

    // Soft delete
    await this.prisma.slot.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async updateStatus(id: string, status: string): Promise<Slot> {
    const slot = await this.prisma.slot.findFirst({
      where: { id, deletedAt: null },
    });

    if (!slot) {
      throw new NotFoundException(`Slot with ID ${id} not found`);
    }

    return this.prisma.slot.update({
      where: { id },
      data: {
        status: status as any,
        updatedAt: new Date(),
      },
      include: {
        terminal: true,
        bookings: {
          include: {
            trip: {
              include: {
                driver: true,
                container: true,
              },
            },
          },
        },
      },
    });
  }

  async bookSlot(id: string, bookingData: {
    tripId: string;
    driverId: string;
    containerId: string;
  }): Promise<SlotBooking> {
    const slot = await this.prisma.slot.findFirst({
      where: { id, deletedAt: null },
    });

    if (!slot) {
      throw new NotFoundException(`Slot with ID ${id} not found`);
    }

    if (slot.status !== 'AVAILABLE') {
      throw new ConflictException(`Slot is not available for booking`);
    }

    // Check if slot has capacity
    if (slot.booked >= slot.capacity) {
      throw new ConflictException(`Slot is at full capacity`);
    }

    // Check if trip exists
    const trip = await this.prisma.trip.findFirst({
      where: { id: bookingData.tripId, deletedAt: null },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${bookingData.tripId} not found`);
    }

    // Check if driver exists
    const driver = await this.prisma.driver.findFirst({
      where: { id: bookingData.driverId, deletedAt: null },
    });

    if (!driver) {
      throw new NotFoundException(`Driver with ID ${bookingData.driverId} not found`);
    }

    // Check if container exists
    const container = await this.prisma.container.findFirst({
      where: { id: bookingData.containerId, deletedAt: null },
    });

    if (!container) {
      throw new NotFoundException(`Container with ID ${bookingData.containerId} not found`);
    }

    // Create booking
    const booking = await this.prisma.slotBooking.create({
      data: {
        id: generateUUID(),
        slotId: id,
        ...bookingData,
      },
    });

    // Update slot booked count
    await this.prisma.slot.update({
      where: { id },
      data: {
        booked: slot.booked + 1,
        status: slot.booked + 1 >= slot.capacity ? 'FULL' : 'AVAILABLE',
        updatedAt: new Date(),
      },
    });

    return booking;
  }

  async cancelBooking(id: string, bookingId: string): Promise<void> {
    const slot = await this.prisma.slot.findFirst({
      where: { id, deletedAt: null },
    });

    if (!slot) {
      throw new NotFoundException(`Slot with ID ${id} not found`);
    }

    const booking = await this.prisma.slotBooking.findFirst({
      where: { id: bookingId, slotId: id },
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    // Delete booking
    await this.prisma.slotBooking.delete({
      where: { id: bookingId },
    });

    // Update slot booked count
    await this.prisma.slot.update({
      where: { id },
      data: {
        booked: Math.max(0, slot.booked - 1),
        status: slot.booked - 1 < slot.capacity ? 'AVAILABLE' : 'FULL',
        updatedAt: new Date(),
      },
    });
  }

  async getStatistics(terminalId?: string): Promise<{
    total: number;
    available: number;
    full: number;
    closed: number;
    maintenance: number;
    averageUtilization: number;
  }> {
    const whereClause: any = { deletedAt: null };

    if (terminalId) {
      whereClause.terminalId = terminalId;
    }

    const slots = await this.prisma.slot.findMany({
      where: whereClause,
    });

    const total = slots.length;
    const available = slots.filter(s => s.status === 'AVAILABLE').length;
    const full = slots.filter(s => s.status === 'FULL').length;
    const closed = slots.filter(s => s.status === 'CLOSED').length;
    const maintenance = slots.filter(s => s.status === 'MAINTENANCE').length;

    const totalCapacity = slots.reduce((sum, slot) => sum + slot.capacity, 0);
    const totalBooked = slots.reduce((sum, slot) => sum + slot.booked, 0);
    const averageUtilization = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

    return {
      total,
      available,
      full,
      closed,
      maintenance,
      averageUtilization,
    };
  }

  async getUtilizationByHour(terminalId: string, date: Date): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const slots = await this.prisma.slot.findMany({
      where: {
        terminalId,
        windowStart: {
          gte: startOfDay,
          lte: endOfDay,
        },
        deletedAt: null,
      },
      include: {
        bookings: true,
      },
    });

    // Group by hour
    const hourlyData = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourSlots = slots.filter(slot => {
        const slotHour = slot.windowStart.getHours();
        return slotHour === hour;
      });

      const totalCapacity = hourSlots.reduce((sum, slot) => sum + slot.capacity, 0);
      const totalBooked = hourSlots.reduce((sum, slot) => sum + slot.booked, 0);
      const utilization = totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;

      hourlyData.push({
        hour,
        totalSlots: hourSlots.length,
        totalCapacity,
        totalBooked,
        utilization,
      });
    }

    return hourlyData;
  }
}
