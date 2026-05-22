import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class LeadRepository {
  static async findById(id: string) {
    return prisma.lead.findUnique({
      where: { id },
      include: {
        assignedToUser: true,
      },
    });
  }

  static async create(data: Prisma.LeadCreateInput) {
    return prisma.lead.create({
      data,
    });
  }

  static async update(id: string, data: Prisma.LeadUpdateInput) {
    return prisma.lead.update({
      where: { id },
      data,
      include: {
        assignedToUser: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.lead.delete({
      where: { id },
    });
  }

  static async findAll(params?: {
    status?: string;
    source?: string;
    assignedTo?: string;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.LeadWhereInput = {};

    if (params?.status) {
      where.status = params.status;
    }
    if (params?.source) {
      where.source = params.source;
    }
    if (params?.assignedTo) {
      where.assignedTo = params.assignedTo;
    }
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
        { phone: { contains: params.search } },
        { notes: { contains: params.search } },
      ];
    }

    return prisma.lead.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        assignedToUser: true,
      },
      skip: params?.skip,
      take: params?.take,
    });
  }

  static async count(params?: {
    status?: string;
    source?: string;
    assignedTo?: string;
    search?: string;
  }) {
    const where: Prisma.LeadWhereInput = {};

    if (params?.status) {
      where.status = params.status;
    }
    if (params?.source) {
      where.source = params.source;
    }
    if (params?.assignedTo) {
      where.assignedTo = params.assignedTo;
    }
    if (params?.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
        { phone: { contains: params.search } },
      ];
    }

    return prisma.lead.count({ where });
  }

  static async groupByStatus() {
    return prisma.lead.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });
  }
}
