import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTerminalDto } from './dto/create-terminal.dto';
import { UpdateTerminalDto } from './dto/update-terminal.dto';
import { Terminal, TerminalSettings } from '@prisma/client';
import { PaginationDto, PaginationResponseDto } from '../common/dto/pagination.dto';
import { createPaginationResponse, getPaginationSkip, getPaginationTake } from '../common/utils/pagination.util';

// Simple UUID generator function
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

@Injectable()
export class TerminalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination?: PaginationDto): Promise<PaginationResponseDto<Terminal> | Terminal[]> {
    const skip = pagination ? getPaginationSkip(pagination) : 0;
    const take = pagination ? getPaginationTake(pagination) : 1000; // Default limit when no pagination
    
    const [terminals, total] = await Promise.all([
      this.prisma.terminal.findMany({
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
        skip,
        take,
      }),
      pagination ? this.prisma.terminal.count({ where: { deletedAt: null } }) : 0,
    ]);

    if (pagination) {
      return createPaginationResponse(terminals, total, pagination);
    }

    return terminals;
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

    const terminalId = generateUUID();

    return this.prisma.terminal.create({
      data: {
        id: terminalId,
        ...terminalData,
        settings: settings
          ? {
              create: {
                id: generateUUID(),
                slotDuration: settings.slotDuration,
                maxSlotsPerWindow: settings.maxSlotsPerWindow,
                operatingHours: settings.operatingHours,
                closedDays: settings.closedDays,
                specialRules: settings.specialRules,
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
                  slotDuration: settings.slotDuration,
                  maxSlotsPerWindow: settings.maxSlotsPerWindow,
                  operatingHours: settings.operatingHours,
                  closedDays: settings.closedDays,
                  specialRules: settings.specialRules,
                },
                update: {
                  slotDuration: settings.slotDuration,
                  maxSlotsPerWindow: settings.maxSlotsPerWindow,
                  operatingHours: settings.operatingHours,
                  closedDays: settings.closedDays,
                  specialRules: settings.specialRules,
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
