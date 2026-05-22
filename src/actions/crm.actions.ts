'use server';

import { AuthService } from '@/services/auth.service';
import { CrmService } from '@/services/crm.service';
import { leadSchema, paymentSchema, courseSchema, lectureSchema, taskSchema, attendanceSchema } from '@/validations/schemas';
import { revalidatePath } from 'next/cache';

// Helper to authenticate caller
async function getAuthedUser() {
  const session = await AuthService.getSession();
  if (!session?.user) {
    throw new Error('Unauthenticated: Please log in to perform this action.');
  }
  return session.user;
}

// --- Dashboard & General ---
export async function getDashboardStatsAction() {
  try {
    const user = await getAuthedUser();
    const stats = await CrmService.getDashboardStats(user);
    return { success: true, data: stats };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load dashboard statistics' };
  }
}

// --- Leads Actions ---
export async function getLeadsAction(filters: any) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.getLeads(filters, user);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load leads' };
  }
}

export async function createLeadAction(data: any) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.createLead(data, user);
    revalidatePath('/dashboard/leads');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create lead' };
  }
}

export async function updateLeadAction(id: string, data: any) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.updateLead(id, data, user);
    revalidatePath('/dashboard/leads');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update lead' };
  }
}

export async function deleteLeadAction(id: string) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.deleteLead(id, user);
    revalidatePath('/dashboard/leads');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete lead' };
  }
}

// --- Students Actions ---
export async function getStudentsAction(filters: any) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.getStudents(filters, user);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load students' };
  }
}

export async function getStudentProfileAction(studentId: string) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.getStudentProfile(studentId, user);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load student profile' };
  }
}

export async function enrollStudentAction(studentId: string, courseId: string) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.enrollStudent(studentId, courseId, user);
    revalidatePath('/dashboard/students');
    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to enroll student' };
  }
}

export async function removeEnrollmentAction(studentId: string, courseId: string) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.removeEnrollment(studentId, courseId, user);
    revalidatePath('/dashboard/students');
    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to remove enrollment' };
  }
}

// --- Payments Actions ---
export async function getPaymentsAction(filters: any) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.getPayments(filters, user);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load payments' };
  }
}

export async function createPaymentAction(data: any) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.createPayment(data, user);
    revalidatePath('/dashboard/payments');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to record payment' };
  }
}

// --- Courses & Lectures Actions ---
export async function getCoursesAction(filters: any) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.getCourses(filters, user);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load courses' };
  }
}

export async function getCourseDetailsAction(id: string) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.getCourseDetails(id, user);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load course details' };
  }
}

export async function createCourseAction(data: any) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.createCourse(data, user);
    revalidatePath('/dashboard/courses');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create course' };
  }
}

export async function createLectureAction(data: any) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.createLecture(data, user);
    revalidatePath('/dashboard/courses');
    revalidatePath(`/dashboard/courses/${data.courseId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to add lecture' };
  }
}

export async function deleteLectureAction(id: string, courseId: string) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.deleteLecture(id, user);
    revalidatePath('/dashboard/courses');
    revalidatePath(`/dashboard/courses/${courseId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete lecture' };
  }
}

// --- Attendance Actions ---
export async function getAttendanceByLectureAction(lectureId: string) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.getAttendanceByLecture(lectureId, user);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load attendance logs' };
  }
}

export async function markAttendanceAction(data: any) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.markAttendance(data, user);
    revalidatePath('/dashboard/attendance');
    revalidatePath(`/dashboard/courses/${data.courseId}`);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to log attendance' };
  }
}

export async function getStudentAttendanceAction(studentId: string) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.getAttendanceByStudent(studentId, user);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load attendance' };
  }
}

// --- Tasks Actions ---
export async function getTasksAction(filters: any) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.getTasks(filters, user);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to load tasks' };
  }
}

export async function createTaskAction(data: any) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.createTask(data, user);
    revalidatePath('/dashboard/tasks');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create task' };
  }
}

export async function updateTaskAction(id: string, data: any) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.updateTask(id, data, user);
    revalidatePath('/dashboard/tasks');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update task' };
  }
}

export async function deleteTaskAction(id: string) {
  try {
    const user = await getAuthedUser();
    const result = await CrmService.deleteTask(id, user);
    revalidatePath('/dashboard/tasks');
    revalidatePath('/dashboard');
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to delete task' };
  }
}
