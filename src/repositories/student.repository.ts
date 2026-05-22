import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class StudentRepository {
  static async findById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        enrollments: {
          include: {
            course: true,
          },
        },
        payments: true,
        attendance: {
          include: {
            lecture: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });
  }

  static async findByUserId(userId: string) {
    return prisma.student.findUnique({
      where: { userId },
      include: {
        user: true,
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });
  }

  static async create(data: Prisma.StudentUncheckedCreateInput) {
    return prisma.student.create({
      data,
    });
  }

  static async update(id: string, data: Prisma.StudentUpdateInput) {
    return prisma.student.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.student.delete({
      where: { id },
    });
  }

  static async findAll(params?: {
    level?: string;
    search?: string;
    skip?: number;
    take?: number;
    instructorId?: string;
  }) {
    const where: Prisma.StudentWhereInput = {};

    if (params?.level) {
      where.level = params.level;
    }

    if (params?.instructorId) {
      where.enrollments = {
        some: {
          course: {
            instructorId: params.instructorId,
          },
        },
      };
    }

    if (params?.search) {
      where.user = {
        OR: [
          { name: { contains: params.search } },
          { email: { contains: params.search } },
          { phone: { contains: params.search } },
        ],
      };
    }

    return prisma.student.findMany({
      where,
      orderBy: { joinedAt: 'desc' },
      include: {
        user: true,
        enrollments: {
          include: {
            course: true,
          },
        },
      },
      skip: params?.skip,
      take: params?.take,
    });
  }

  static async count(params?: { level?: string; search?: string; instructorId?: string }) {
    const where: Prisma.StudentWhereInput = {};

    if (params?.level) {
      where.level = params.level;
    }

    if (params?.instructorId) {
      where.enrollments = {
        some: {
          course: {
            instructorId: params.instructorId,
          },
        },
      };
    }

    if (params?.search) {
      where.user = {
        OR: [
          { name: { contains: params.search } },
          { email: { contains: params.search } },
          { phone: { contains: params.search } },
        ],
      };
    }

    return prisma.student.count({ where });
  }

  // --- Enrollments ---
  static async enrollStudent(studentId: string, courseId: string) {
    return prisma.enrollment.create({
      data: {
        studentId,
        courseId,
        status: 'ACTIVE',
      },
    });
  }

  static async removeEnrollment(studentId: string, courseId: string) {
    return prisma.enrollment.deleteMany({
      where: {
        studentId,
        courseId,
      },
    });
  }

  static async updateEnrollmentStatus(id: string, status: string) {
    return prisma.enrollment.update({
      where: { id },
      data: { status },
    });
  }
}
