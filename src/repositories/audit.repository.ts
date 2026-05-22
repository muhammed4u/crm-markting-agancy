import { prisma } from '@/lib/prisma';

export class AuditRepository {
  static async logActivity(userId: string | null, action: string, details: string) {
    return prisma.activityLog.create({
      data: {
        userId,
        action,
        details,
      },
    });
  }

  static async logAuditTrail(params: {
    userId: string | null;
    entity: string;
    entityId: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    oldValues?: object | null;
    newValues?: object | null;
  }) {
    return prisma.auditTrail.create({
      data: {
        userId: params.userId,
        entity: params.entity,
        entityId: params.entityId,
        action: params.action,
        oldValues: params.oldValues ? JSON.stringify(params.oldValues) : null,
        newValues: params.newValues ? JSON.stringify(params.newValues) : null,
      },
    });
  }

  static async findActivities(params?: { limit?: number; userId?: string }) {
    const where: { userId?: string } = {};
    if (params?.userId) {
      where.userId = params.userId;
    }

    return prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      take: params?.limit || 50,
    });
  }

  static async findAuditTrails(params?: { entity?: string; limit?: number }) {
    const where: { entity?: string } = {};
    if (params?.entity) {
      where.entity = params.entity;
    }

    return prisma.auditTrail.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      take: params?.limit || 100,
    });
  }
}
