import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class UserRepository {
  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        permissions: true,
      },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: true,
        permissions: true,
      },
    });
  }

  static async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
    });
  }

  static async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  static async findAll(params?: {
    role?: string;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.UserWhereInput = {};

    if (params?.role) {
      where.role = params.role;
    }

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
        { phone: { contains: params.search } },
      ];
    }

    return prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: params?.skip,
      take: params?.take,
    });
  }

  static async count(params?: { role?: string; search?: string }) {
    const where: Prisma.UserWhereInput = {};

    if (params?.role) {
      where.role = params.role;
    }

    if (params?.search) {
      where.OR = [
        { name: { contains: params.search } },
        { email: { contains: params.search } },
        { phone: { contains: params.search } },
      ];
    }

    return prisma.user.count({ where });
  }
}
