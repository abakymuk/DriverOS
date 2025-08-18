import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVesselDto } from './dto/create-vessel.dto';
import { UpdateVesselDto } from './dto/update-vessel.dto';
import { Vessel, VesselSchedule } from '@prisma/client';
// Local UUID generator function
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

@Injectable()
export class VesselsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Vessel[]> {
    return this.prisma.vessel.findMany({
      where: { deletedAt: null },
      include: {
        terminal: true,
        schedules: true,
        containers: {
          where: { deletedAt: null },
          include: {
            holds: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Vessel> {
    const vessel = await this.prisma.vessel.findFirst({
      where: { id, deletedAt: null },
      include: {
        terminal: true,
        schedules: true,
        containers: {
          where: { deletedAt: null },
          include: {
            holds: true,
          },
        },
      },
    });

    if (!vessel) {
      throw new NotFoundException(`Vessel with ID ${id} not found`);
    }

    return vessel;
  }

  async findByTerminal(terminalId: string): Promise<Vessel[]> {
    return this.prisma.vessel.findMany({
      where: { terminalId, deletedAt: null },
      include: {
        terminal: true,
        schedules: true,
        containers: {
          where: { deletedAt: null },
          include: {
            holds: true,
          },
        },
      },
      orderBy: { eta: 'asc' },
    });
  }

  async findActive(): Promise<Vessel[]> {
    return this.prisma.vessel.findMany({
      where: {
        deletedAt: null,
        status: { in: ['ARRIVING', 'BERTHED', 'DISCHARGING'] },
      },
      include: {
        terminal: true,
        schedules: true,
        containers: {
          where: { deletedAt: null },
          include: {
            holds: true,
          },
        },
      },
      orderBy: { eta: 'asc' },
    });
  }

  async create(createVesselDto: CreateVesselDto): Promise<Vessel> {
    const { schedules, ...vesselData } = createVesselDto;

    // Check if terminal exists
    const terminal = await this.prisma.terminal.findFirst({
      where: { id: vesselData.terminalId, deletedAt: null },
    });

    if (!terminal) {
      throw new NotFoundException(`Terminal with ID ${vesselData.terminalId} not found`);
    }

    return this.prisma.vessel.create({
      data: {
        id: generateUUID(),
        ...vesselData,
        schedules: schedules
          ? {
              create: schedules.map(schedule => ({
                id: generateUUID(),
                ...schedule,
              })),
            }
          : undefined,
      },
      include: {
        terminal: true,
        schedules: true,
      },
    });
  }

  async update(id: string, updateVesselDto: UpdateVesselDto): Promise<Vessel> {
    const { schedules, ...vesselData } = updateVesselDto;

    // Check if vessel exists
    const existingVessel = await this.prisma.vessel.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingVessel) {
      throw new NotFoundException(`Vessel with ID ${id} not found`);
    }

    // Check if terminal exists if terminalId is being updated
    if (vesselData.terminalId && vesselData.terminalId !== existingVessel.terminalId) {
      const terminal = await this.prisma.terminal.findFirst({
        where: { id: vesselData.terminalId, deletedAt: null },
      });

      if (!terminal) {
        throw new NotFoundException(`Terminal with ID ${vesselData.terminalId} not found`);
      }
    }

    return this.prisma.vessel.update({
      where: { id },
      data: {
        ...vesselData,
        updatedAt: new Date(),
        schedules: schedules
          ? {
              deleteMany: {},
              create: schedules.map(schedule => ({
                id: generateUUID(),
                vesselId: id,
                ...schedule,
              })),
            }
          : undefined,
      },
      include: {
        terminal: true,
        schedules: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const vessel = await this.prisma.vessel.findFirst({
      where: { id, deletedAt: null },
    });

    if (!vessel) {
      throw new NotFoundException(`Vessel with ID ${id} not found`);
    }

    // Soft delete
    await this.prisma.vessel.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async updateStatus(id: string, status: string): Promise<Vessel> {
    const vessel = await this.prisma.vessel.findFirst({
      where: { id, deletedAt: null },
    });

    if (!vessel) {
      throw new NotFoundException(`Vessel with ID ${id} not found`);
    }

    return this.prisma.vessel.update({
      where: { id },
      data: {
        status: status as any,
        updatedAt: new Date(),
      },
      include: {
        terminal: true,
        schedules: true,
      },
    });
  }

  async getContainerCount(id: string): Promise<{ total: number; ready: number; hold: number }> {
    const vessel = await this.prisma.vessel.findFirst({
      where: { id, deletedAt: null },
      include: {
        containers: {
          where: { deletedAt: null },
        },
      },
    });

    if (!vessel) {
      throw new NotFoundException(`Vessel with ID ${id} not found`);
    }

    const total = vessel.containers.length;
    const ready = vessel.containers.filter(c => c.status === 'READY').length;
    const hold = vessel.containers.filter(c => c.hold).length;

    return { total, ready, hold };
  }

  async getSchedule(id: string): Promise<VesselSchedule[]> {
    const vessel = await this.prisma.vessel.findFirst({
      where: { id, deletedAt: null },
      include: {
        schedules: true,
      },
    });

    if (!vessel) {
      throw new NotFoundException(`Vessel with ID ${id} not found`);
    }

    return vessel.schedules;
  }
}
