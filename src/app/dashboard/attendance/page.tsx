import React from 'react';
import { AuthService } from '@/services/auth.service';
import { CrmService } from '@/services/crm.service';
import { prisma } from '@/lib/prisma';
import { AttendanceClient } from '@/components/attendance-client';
import { redirect } from 'next/navigation';

export default async function AttendancePage() {
  const session = await AuthService.getSession();
  if (!session?.user) {
    redirect('/login');
  }

  let courses: any[] = [];
  let studentRecords: any[] = [];

  if (session.user.role === 'ADMIN' || session.user.role === 'INSTRUCTOR') {
    // Fetch courses with lectures and enrolled students for roll sheets
    const dbCourses = await prisma.course.findMany({
      include: {
        lectures: {
          orderBy: { date: 'asc' },
        },
        enrollments: {
          where: { status: 'ACTIVE' },
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

    courses = dbCourses.map((c) => ({
      id: c.id,
      title: c.title,
      lectures: c.lectures.map((l) => ({
        id: l.id,
        title: l.title,
        date: l.date.toISOString(),
      })),
      enrollments: c.enrollments.map((e) => ({
        student: {
          id: e.student.id,
          user: {
            name: e.student.user.name,
          },
        },
      })),
    }));
  } else if (session.user.role === 'STUDENT') {
    // Find matching student profile
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (student) {
      const records = await prisma.attendance.findMany({
        where: { studentId: student.id },
        include: {
          lecture: {
            include: {
              course: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      });

      studentRecords = records.map((r) => ({
        id: r.id,
        status: r.status,
        date: r.date.toISOString(),
        lecture: {
          title: r.lecture.title,
          course: {
            title: r.lecture.course.title,
          },
        },
      }));
    }
  }

  return (
    <AttendanceClient
      courses={courses}
      studentRecords={studentRecords}
      currentUser={session.user as any}
    />
  );
}
