import React from 'react';
import { AuthService } from '@/services/auth.service';
import { CrmService } from '@/services/crm.service';
import { StudentProfileClient } from '@/components/student-profile-client';
import { redirect, notFound } from 'next/navigation';
import { hasPermission } from '@/utils/security';

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await AuthService.getSession();
  if (!session?.user) {
    redirect('/login');
  }

  // Await the routing dynamic parameters
  const { id } = params ? await params : { id: '' };
  if (!id) {
    notFound();
  }

  let student: any;
  let attendance: any[] = [];
  let payments: any = { payments: [] };
  let allCourses: any[] = [];

  // 1. Fetch student profile details (critical - throws 404 if failed)
  try {
    student = await CrmService.getStudentProfile(id, session.user);
    if (!student) {
      notFound();
    }
  } catch (error) {
    console.error('Error loading student profile details:', error);
    notFound();
  }

  // 2. Fetch student attendance (non-critical fallback to empty)
  try {
    attendance = await CrmService.getAttendanceByStudent(id, session.user);
  } catch (error) {
    console.warn('Unable to load student attendance:', error);
  }

  // 3. Fetch student payments if authorized (non-critical fallback to empty)
  const hasPaymentsRead = session.user.role === 'STUDENT' || hasPermission(session.user, 'payments:read');
  if (hasPaymentsRead) {
    try {
      payments = await CrmService.getPayments({ studentId: id }, session.user);
    } catch (error) {
      console.warn('Unable to load student payments:', error);
    }
  }

  // 4. Fetch all academy courses (non-critical fallback to empty)
  try {
    allCourses = await CrmService.getCourses({}, session.user);
  } catch (error) {
    console.warn('Unable to load academy courses:', error);
  }

  // Map data to clean serializable props with defensive fallbacks
  const safeStudent = {
    id: student.id,
    bio: student.bio,
    level: student.level,
    user: {
      id: student.user?.id || '',
      name: student.user?.name || 'Unknown',
      email: student.user?.email || '',
      phone: student.user?.phone || '',
    },
    enrollments: (student.enrollments || []).map((e: any) => ({
      id: e.id,
      status: e.status,
      course: {
        id: e.course?.id || '',
        title: e.course?.title || 'Unknown Course',
        price: e.course?.price || 0,
      },
    })),
  };

  const safeAttendance = (attendance || []).map((a: any) => ({
    id: a.id,
    status: a.status,
    date: a.date ? new Date(a.date).toISOString() : new Date().toISOString(),
    lecture: {
      title: a.lecture?.title || 'Unknown Lecture',
      course: {
        title: a.lecture?.course?.title || 'Unknown Course',
      },
    },
  }));

  const safePayments = (payments.payments || []).map((p: any) => ({
    id: p.id,
    amount: p.amount,
    method: p.method,
    status: p.status,
    paidAt: p.paidAt ? new Date(p.paidAt).toISOString() : null,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
  }));

  const safeAllCourses = (allCourses || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    price: c.price,
  }));

  return (
    <StudentProfileClient
      student={safeStudent as any}
      attendance={safeAttendance as any}
      payments={safePayments as any}
      allCourses={safeAllCourses as any}
      hasPaymentsRead={hasPaymentsRead}
    />
  );
}
