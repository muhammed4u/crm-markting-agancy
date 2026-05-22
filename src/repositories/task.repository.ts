import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class TaskRepository {
  static async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        assignedToUser: true,
      },
    });
  }

  static async create(data: Prisma.TaskUncheckedCreateInput) {
    return prisma.task.create({
      data,
    });
  }

  static async update(id: string, data: Prisma.TaskUpdateInput) {
    return prisma.task.update({
      where: { id },
      data,
      include: {
        assignedToUser: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.task.delete({
      where: { id },
    });
  }

  static async findAll(params?: {
    assignedTo?: string;
    status?: string;
    search?: string;
  }) {
    const where: Prisma.TaskWhereInput = {};

    if (params?.assignedTo) {
      where.assignedTo = params.assignedTo;
    }
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.search) {
      where.OR = [
        { title: { contains: params.search } },
        { description: { contains: params.search } },
      ];
    }

    return prisma.task.findMany({
      where,
      orderBy: { deadline: 'asc' },
      include: {
        assignedToUser: true,
      },
    });
  }
}
