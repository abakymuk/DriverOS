import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTerminalDto, UpdateTerminalDto } from './dto';
import { Terminal, TerminalSettings } from '@prisma/client';
import { generateUUID } from '@driveros/types';

@Injectable()
export class TerminalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Terminal[]> {
    return this.prisma.terminal.findMany({
      where: { deletedAt: null },
      include: {
        settings: true,
        vessels: {
          where: { deletedAt: null },
          include: {
            schedules: true,
          },
        },
        containers: {
          where: { deletedAt: null },
          include: {
            holds: true,
          },
        },
        slots: {
          where: { deletedAt: null },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Terminal> {
    const terminal = await this.prisma.terminal.findFirst({
      where: { id, deletedAt: null },
      include: {
        settings: true,
        vessels: {
          where: { deletedAt: null },
          include: {
            schedules: true,
          },
        },
        containers: {
          where: { deletedAt: null },
          include: {
            holds: true,
          },
        },
        slots: {
          where: { deletedAt: null },
        },
      },
    });

    if (!terminal) {
      throw new NotFoundException(`Terminal with ID ${id} not found`);
    }

    return terminal;
  }

  async findByCode(code: string): Promise<Terminal> {
    const terminal = await this.prisma.terminal.findFirst({
      where: { code, deletedAt: null },
      include: {
        settings: true,
      },
    });

    if (!terminal) {
      throw new NotFoundException(`Terminal with code ${code} not found`);
    }

    return terminal;
  }

  async create(createTerminalDto: CreateTerminalDto): Promise<Terminal> {
    const { settings, ...terminalData } = createTerminalDto;

    // Check if terminal code already exists
    const existingTerminal = await this.prisma.terminal.findFirst({
      where: { code: terminalData.code, deletedAt: null },
    });

    if (existingTerminal) {
      throw new ConflictException(`Terminal with code ${terminalData.code} already exists`);
    }

    return this.prisma.terminal.create({
      data: {
        id: generateUUID(),
        ...terminalData,
        settings: settings
          ? {
              create: {
                id: generateUUID(),
                ...settings,
              },
            }
          : undefined,
      },
      include: {
        settings: true,
      },
    });
  }

  async update(id: string, updateTerminalDto: UpdateTerminalDto): Promise<Terminal> {
    const { settings, ...terminalData } = updateTerminalDto;

    // Check if terminal exists
    const existingTerminal = await this.prisma.terminal.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingTerminal) {
      throw new NotFoundException(`Terminal with ID ${id} not found`);
    }

    // Check if new code conflicts with existing terminal
    if (terminalData.code && terminalData.code !== existingTerminal.code) {
      const codeConflict = await this.prisma.terminal.findFirst({
        where: { code: terminalData.code, deletedAt: null },
      });

      if (codeConflict) {
        throw new ConflictException(`Terminal with code ${terminalData.code} already exists`);
      }
    }

    return this.prisma.terminal.update({
      where: { id },
      data: {
        ...terminalData,
        updatedAt: new Date(),
        settings: settings
          ? {
              upsert: {
                create: {
                  id: generateUUID(),
                  terminalId: id,
                  ...settings,
                },
                update: {
                  ...settings,
                  updatedAt: new Date(),
                },
              },
            }
          : undefined,
      },
      include: {
        settings: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const terminal = await this.prisma.terminal.findFirst({
      where: { id, deletedAt: null },
    });

    if (!terminal) {
      throw new NotFoundException(`Terminal with ID ${id} not found`);
    }

    // Soft delete
    await this.prisma.terminal.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async getCapacity(id: string): Promise<{ current: number; max: number; percentage: number }> {
    const terminal = await this.prisma.terminal.findFirst({
      where: { id, deletedAt: null },
      include: {
        containers: {
          where: { deletedAt: null },
        },
      },
    });

    if (!terminal) {
      throw new NotFoundException(`Terminal with ID ${id} not found`);
    }

    const currentCapacity = terminal.containers.length;
    const maxCapacity = terminal.capacity;
    const percentage = Math.round((currentCapacity / maxCapacity) * 100);

    return {
      current: currentCapacity,
      max: maxCapacity,
      percentage,
    };
  }

  async getActiveVessels(id: string): Promise<any[]> {
    const terminal = await this.prisma.terminal.findFirst({
      where: { id, deletedAt: null },
      include: {
        vessels: {
          where: { 
            deletedAt: null,
            status: { in: ['ARRIVING', 'BERTHED', 'DISCHARGING'] },
          },
          include: {
            schedules: true,
            containers: {
              where: { deletedAt: null },
            },
          },
        },
      },
    });

    if (!terminal) {
      throw new NotFoundException(`Terminal with ID ${id} not found`);
    }

    return terminal.vessels;
  }

  async getAvailableSlots(id: string, date?: Date): Promise<any[]> {
    const whereClause: any = {
      terminalId: id,
      deletedAt: null,
      status: 'AVAILABLE',
    };

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
}
