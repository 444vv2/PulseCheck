import { Injectable, NotFoundException } from '@nestjs/common';
import { Monitor } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMonitorDto } from './dto/create-monitor.dto';
import { ListMonitorsQueryDto } from './dto/list-monitors-query.dto';
import { UpdateMonitorDto } from './dto/update-monitor.dto';

@Injectable()
export class MonitorsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    ownerId: string,
    { page, limit }: ListMonitorsQueryDto,
  ): Promise<{ items: Monitor[]; total: number }> {
    const where = { ownerId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.monitor.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.monitor.count({ where }),
    ]);

    return { items, total };
  }

  create(ownerId: string, data: CreateMonitorDto): Promise<Monitor> {
    return this.prisma.monitor.create({ data: { ...data, ownerId } });
  }

  async findOne(ownerId: string, id: string): Promise<Monitor> {
    const monitor = await this.prisma.monitor.findFirst({
      where: { id, ownerId },
    });

    if (!monitor) {
      throw new NotFoundException('Monitor not found');
    }

    return monitor;
  }

  async update(
    ownerId: string,
    id: string,
    data: UpdateMonitorDto,
  ): Promise<Monitor> {
    await this.findOne(ownerId, id);
    return this.prisma.monitor.update({ where: { id }, data });
  }

  async remove(ownerId: string, id: string): Promise<void> {
    await this.findOne(ownerId, id);
    await this.prisma.monitor.delete({ where: { id } });
  }
}

