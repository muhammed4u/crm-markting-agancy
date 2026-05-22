import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class AttendanceRepository {
  static async findById(id: string) {
    return prisma.attendance.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        lecture: true,
      },
    });
  }

  static async mark(data: {
    studentId: string;
    lectureId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE';
    date: Date;
  }) {
    // Check if attendance already exists for this student and lecture
    const existing = await prisma.attendance.findFirst({
      where: {
        studentId: data.studentId,
        lectureId: data.lectureId,
      },
    });

    if (existing) {
      return prisma.attendance.update({
        where: { id: existing.id },
        data: {
          status: data.status,
          date: data.date,
        },
      });
    }

    return prisma.attendance.create({
      data,
    });
  }

  static async findByLecture(lectureId: string) {
    return prisma.attendance.findMany({
      where: { lectureId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  static async findByStudent(studentId: string) {
    return prisma.attendance.findMany({
      where: { studentId },
      include: {
        lecture: {
          include: {
            course: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  static async statsByLecture(lectureId: string) {
    const attendance = await prisma.attendance.findMany({
      where: { lectureId },
      select: { status: true },
    });

    const counts = { PRESENT: 0, ABSENT: 0, LATE: 0 };
    attendance.forEach((a) => {
      if (a.status === 'PRESENT') counts.PRESENT++;
      if (a.status === 'ABSENT') counts.ABSENT++;
      if (a.status === 'LATE') counts.LATE++;
    });

    return counts;
  }
}
