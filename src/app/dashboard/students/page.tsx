import React from 'react';
import { AuthService } from '@/services/auth.service';
import { CrmService } from '@/services/crm.service';
import { StudentsClient } from '@/components/students-client';
import { redirect } from 'next/navigation';

export default async function StudentsPage() {
  const session = await AuthService.getSession();
  if (!session?.user) {
    redirect('/login');
  }

  // Fetch student listings
  const students = await CrmService.getStudents({}, session.user);

  // Map to clean serializeable props
  const safeStudents = students.students.map((s: any) => ({
    id: s.id,
    bio: s.bio,
    level: s.level,
    user: {
      id: s.user.id,
      name: s.user.name,
      email: s.user.email,
      phone: s.user.phone,
    },
    enrollments: s.enrollments.map((e: any) => ({
      id: e.id,
      course: {
        id: e.course.id,
        title: e.course.title,
      },
    })),
  }));

  return (
    <StudentsClient initialStudents={safeStudents as any} />
  );
}
