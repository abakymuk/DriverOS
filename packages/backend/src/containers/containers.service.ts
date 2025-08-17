import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContainerDto, UpdateContainerDto } from './dto';
import { Container, ContainerHold } from '@prisma/client';
import { generateUUID } from '@driveros/types';

@Injectable()
export class ContainersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Container[]> {
    return this.prisma.container.findMany({
      where: { deletedAt: null },
      include: {
        terminal: true,
        vessel: true,
        holds: true,
        trips: {
          where: { deletedAt: null },
          include: {
            driver: true,
            pickupSlot: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Container> {
    const container = await this.prisma.container.findFirst({
      where: { id, deletedAt: null },
      include: {
        terminal: true,
        vessel: true,
        holds: true,
        trips: {
          where: { deletedAt: null },
          include: {
            driver: true,
            pickupSlot: true,
          },
        },
      },
    });

    if (!container) {
      throw new NotFoundException(`Container with ID ${id} not found`);
    }

    return container;
  }

  async findByCntrNo(cntrNo: string): Promise<Container> {
    const container = await this.prisma.container.findFirst({
      where: { cntrNo, deletedAt: null },
      include: {
        terminal: true,
        vessel: true,
        holds: true,
      },
    });

    if (!container) {
      throw new NotFoundException(`Container with number ${cntrNo} not found`);
    }

    return container;
  }

  async findByTerminal(terminalId: string): Promise<Container[]> {
    return this.prisma.container.findMany({
      where: { terminalId, deletedAt: null },
      include: {
        terminal: true,
        vessel: true,
        holds: true,
        trips: {
          where: { deletedAt: null },
          include: {
            driver: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByVessel(vesselId: string): Promise<Container[]> {
    return this.prisma.container.findMany({
      where: { vesselId, deletedAt: null },
      include: {
        terminal: true,
        vessel: true,
        holds: true,
        trips: {
          where: { deletedAt: null },
          include: {
            driver: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findReady(): Promise<Container[]> {
    return this.prisma.container.findMany({
      where: { 
        deletedAt: null,
        status: 'READY',
        hold: false,
      },
      include: {
        terminal: true,
        vessel: true,
        holds: true,
      },
      orderBy: { readyAt: 'asc' },
    });
  }

  async findOnHold(): Promise<Container[]> {
    return this.prisma.container.findMany({
      where: { 
        deletedAt: null,
        hold: true,
      },
      include: {
        terminal: true,
        vessel: true,
        holds: {
          where: { resolvedAt: null },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(createContainerDto: CreateContainerDto): Promise<Container> {
    const { holds, ...containerData } = createContainerDto;

    // Check if container number already exists
    const existingContainer = await this.prisma.container.findFirst({
      where: { cntrNo: containerData.cntrNo, deletedAt: null },
    });

    if (existingContainer) {
      throw new ConflictException(`Container with number ${containerData.cntrNo} already exists`);
    }

    // Check if terminal exists
    const terminal = await this.prisma.terminal.findFirst({
      where: { id: containerData.terminalId, deletedAt: null },
    });

    if (!terminal) {
      throw new NotFoundException(`Terminal with ID ${containerData.terminalId} not found`);
    }

    // Check if vessel exists if provided
    if (containerData.vesselId) {
      const vessel = await this.prisma.vessel.findFirst({
        where: { id: containerData.vesselId, deletedAt: null },
      });

      if (!vessel) {
        throw new NotFoundException(`Vessel with ID ${containerData.vesselId} not found`);
      }
    }

    return this.prisma.container.create({
      data: {
        id: generateUUID(),
        ...containerData,
        holds: holds
          ? {
              create: holds.map(hold => ({
                id: generateUUID(),
                ...hold,
              })),
            }
          : undefined,
      },
      include: {
        terminal: true,
        vessel: true,
        holds: true,
      },
    });
  }

  async update(id: string, updateContainerDto: UpdateContainerDto): Promise<Container> {
    const { holds, ...containerData } = updateContainerDto;

    // Check if container exists
    const existingContainer = await this.prisma.container.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingContainer) {
      throw new NotFoundException(`Container with ID ${id} not found`);
    }

    // Check if new container number conflicts with existing container
    if (containerData.cntrNo && containerData.cntrNo !== existingContainer.cntrNo) {
      const cntrNoConflict = await this.prisma.container.findFirst({
        where: { cntrNo: containerData.cntrNo, deletedAt: null },
      });

      if (cntrNoConflict) {
        throw new ConflictException(`Container with number ${containerData.cntrNo} already exists`);
      }
    }

    // Check if terminal exists if terminalId is being updated
    if (containerData.terminalId && containerData.terminalId !== existingContainer.terminalId) {
      const terminal = await this.prisma.terminal.findFirst({
        where: { id: containerData.terminalId, deletedAt: null },
      });

      if (!terminal) {
        throw new NotFoundException(`Terminal with ID ${containerData.terminalId} not found`);
      }
    }

    // Check if vessel exists if vesselId is being updated
    if (containerData.vesselId && containerData.vesselId !== existingContainer.vesselId) {
      const vessel = await this.prisma.vessel.findFirst({
        where: { id: containerData.vesselId, deletedAt: null },
      });

      if (!vessel) {
        throw new NotFoundException(`Vessel with ID ${containerData.vesselId} not found`);
      }
    }

    return this.prisma.container.update({
      where: { id },
      data: {
        ...containerData,
        updatedAt: new Date(),
        holds: holds
          ? {
              deleteMany: {},
              create: holds.map(hold => ({
                id: generateUUID(),
                containerId: id,
                ...hold,
              })),
            }
          : undefined,
      },
      include: {
        terminal: true,
        vessel: true,
        holds: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const container = await this.prisma.container.findFirst({
      where: { id, deletedAt: null },
    });

    if (!container) {
      throw new NotFoundException(`Container with ID ${id} not found`);
    }

    // Soft delete
    await this.prisma.container.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async addHold(id: string, holdData: { reason: string; description?: string }): Promise<ContainerHold> {
    const container = await this.prisma.container.findFirst({
      where: { id, deletedAt: null },
    });

    if (!container) {
      throw new NotFoundException(`Container with ID ${id} not found`);
    }

    // Update container hold status
    await this.prisma.container.update({
      where: { id },
      data: {
        hold: true,
        status: 'HOLD',
        updatedAt: new Date(),
      },
    });

    // Create hold record
    return this.prisma.containerHold.create({
      data: {
        id: generateUUID(),
        containerId: id,
        ...holdData,
      },
    });
  }

  async resolveHold(id: string, holdId: string): Promise<Container> {
    const container = await this.prisma.container.findFirst({
      where: { id, deletedAt: null },
      include: {
        holds: {
          where: { resolvedAt: null },
        },
      },
    });

    if (!container) {
      throw new NotFoundException(`Container with ID ${id} not found`);
    }

    // Resolve the specific hold
    await this.prisma.containerHold.update({
      where: { id: holdId },
      data: {
        resolvedAt: new Date(),
      },
    });

    // Check if there are any remaining unresolved holds
    const remainingHolds = await this.prisma.containerHold.count({
      where: {
        containerId: id,
        resolvedAt: null,
      },
    });

    // Update container hold status if no remaining holds
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (remainingHolds === 0) {
      updateData.hold = false;
      updateData.status = 'NOT_READY';
    }

    return this.prisma.container.update({
      where: { id },
      data: updateData,
      include: {
        terminal: true,
        vessel: true,
        holds: true,
      },
    });
  }

  async updateStatus(id: string, status: string): Promise<Container> {
    const container = await this.prisma.container.findFirst({
      where: { id, deletedAt: null },
    });

    if (!container) {
      throw new NotFoundException(`Container with ID ${id} not found`);
    }

    return this.prisma.container.update({
      where: { id },
      data: {
        status: status as any,
        updatedAt: new Date(),
      },
      include: {
        terminal: true,
        vessel: true,
        holds: true,
      },
    });
  }

  async getStatistics(): Promise<{
    total: number;
    ready: number;
    notReady: number;
    onHold: number;
    picked: number;
    delivered: number;
  }> {
    const containers = await this.prisma.container.findMany({
      where: { deletedAt: null },
    });

    const total = containers.length;
    const ready = containers.filter(c => c.status === 'READY').length;
    const notReady = containers.filter(c => c.status === 'NOT_READY').length;
    const onHold = containers.filter(c => c.hold).length;
    const picked = containers.filter(c => c.status === 'PICKED').length;
    const delivered = containers.filter(c => c.status === 'DELIVERED').length;

    return {
      total,
      ready,
      notReady,
      onHold,
      picked,
      delivered,
    };
  }
}
