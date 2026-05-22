import React from 'react';
import { AuthService } from '@/services/auth.service';
import { CrmService } from '@/services/crm.service';
import { UserRepository } from '@/repositories/user.repository';
import { CoursesClient } from '@/components/courses-client';
import { redirect } from 'next/navigation';

export default async function CoursesPage() {
  const session = await AuthService.getSession();
  if (!session?.user) {
    redirect('/login');
  }

  // 1. Fetch all catalog courses
  const courses = await CrmService.getCourses({}, session.user);

  // 2. Fetch instructors for assignments
  const instructors = await UserRepository.findAll({ role: 'INSTRUCTOR' });

  // Map to clean serializable props
  const safeCourses = courses.map((c: any) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    price: c.price,
    thumbnail: c.thumbnail,
    instructorId: c.instructorId,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    instructor: c.instructor ? {
      name: c.instructor.name,
    } : null,
  }));

  const safeInstructors = instructors.map((i: any) => ({
    id: i.id,
    name: i.name,
  }));

  return (
    <CoursesClient
      initialCourses={safeCourses as any}
      instructors={safeInstructors}
      currentUser={session.user}
    />
  );
}
