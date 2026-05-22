import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class CourseRepository {
  static async findById(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: {
        instructor: true,
        lectures: {
          orderBy: { date: 'asc' },
        },
        enrollments: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  static async create(data: Prisma.CourseCreateInput) {
    return prisma.course.create({
      data,
    });
  }

  static async update(id: string, data: Prisma.CourseUpdateInput) {
    return prisma.course.update({
      where: { id },
      data,
      include: {
        instructor: true,
      },
    });
  }

  static async delete(id: string) {
    return prisma.course.delete({
      where: { id },
    });
  }

  static async findAll(params?: { search?: string; instructorId?: string }) {
    const where: Prisma.CourseWhereInput = {};

    if (params?.instructorId) {
      where.instructorId = params.instructorId;
    }

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search } },
        { description: { contains: params.search } },
      ];
    }

    return prisma.course.findMany({
      where,
      orderBy: { title: 'asc' },
      include: {
        instructor: true,
        _count: {
          select: {
            enrollments: true,
            lectures: true,
          },
        },
      },
    });
  }

  // --- Lecture Management ---
  static async createLecture(data: Prisma.LectureUncheckedCreateInput) {
    return prisma.lecture.create({
      data,
    });
  }

  static async updateLecture(id: string, data: Prisma.LectureUpdateInput) {
    return prisma.lecture.update({
      where: { id },
      data,
    });
  }

  static async deleteLecture(id: string) {
    return prisma.lecture.delete({
      where: { id },
    });
  }

  static async findLectureById(id: string) {
    return prisma.lecture.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });
  }
}
