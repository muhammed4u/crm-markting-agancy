import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class PaymentRepository {
  static async findById(id: string) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  static async create(data: Prisma.PaymentUncheckedCreateInput) {
    return prisma.payment.create({
      data,
    });
  }

  static async update(id: string, data: Prisma.PaymentUpdateInput) {
    return prisma.payment.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    return prisma.payment.delete({
      where: { id },
    });
  }

  static async findAll(params?: {
    studentId?: string;
    status?: string;
    method?: string;
    skip?: number;
    take?: number;
  }) {
    const where: Prisma.PaymentWhereInput = {};

    if (params?.studentId) {
      where.studentId = params.studentId;
    }
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.method) {
      where.method = params.method;
    }

    return prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
    });
  }

  static async count(params?: { studentId?: string; status?: string; method?: string }) {
    const where: Prisma.PaymentWhereInput = {};

    if (params?.studentId) {
      where.studentId = params.studentId;
    }
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.method) {
      where.method = params.method;
    }

    return prisma.payment.count({ where });
  }

  static async sumRevenue() {
    const result = await prisma.payment.aggregate({
      where: {
        status: 'PAID',
      },
      _sum: {
        amount: true,
      },
    });
    return result._sum.amount || 0;
  }

  static async monthlyRevenue() {
    // In Prisma with SQLite, dynamic date functions are simple but grouping can be processed in memory.
    // This allows it to work universally on SQLite and PostgreSQL.
    const payments = await prisma.payment.findMany({
      where: {
        status: 'PAID',
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap: { [key: string]: number } = {};

    // Initialize map
    months.forEach((m) => {
      monthlyMap[m] = 0;
    });

    payments.forEach((p) => {
      const monthIndex = new Date(p.createdAt).getMonth();
      const monthName = months[monthIndex];
      monthlyMap[monthName] = (monthlyMap[monthName] || 0) + p.amount;
    });

    return Object.entries(monthlyMap).map(([month, amount]) => ({
      month,
      amount,
    }));
  }
}
