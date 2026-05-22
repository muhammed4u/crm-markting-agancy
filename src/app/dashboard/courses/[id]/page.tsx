import React from 'react';
import { AuthService } from '@/services/auth.service';
import { CrmService } from '@/services/crm.service';
import { CourseDetailsClient } from '@/components/course-details-client';
import { redirect, notFound } from 'next/navigation';

export default async function CourseDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await AuthService.getSession();
  if (!session?.user) {
    redirect('/login');
  }

  // Await the routing dynamic parameters
  const { id } = await params;

  let course: any;

  try {
    course = await CrmService.getCourseDetails(id, session.user);
    if (!course) {
      notFound();
    }
  } catch (error) {
    console.error('Error fetching course details:', error);
    notFound();
  }

  // Map course details to serializable properties
  const safeCourse = {
    id: course.id,
    title: course.title,
    description: course.description,
    price: course.price,
    thumbnail: course.thumbnail,
    instructor: course.instructor ? {
      name: course.instructor.name,
      email: course.instructor.email,
    } : null,
  };

  const safeLectures = course.lectures.map((l: any) => ({
    id: l.id,
    title: l.title,
    videoUrl: l.videoUrl,
    fileUrl: l.fileUrl,
    date: l.date.toISOString(),
  }));

  return (
    <CourseDetailsClient
      course={safeCourse as any}
      lectures={safeLectures}
      currentUser={session.user as any}
    />
  );
}
