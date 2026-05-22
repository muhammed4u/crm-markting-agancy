import { LeadRepository } from '@/repositories/lead.repository';
import { StudentRepository } from '@/repositories/student.repository';
import { CourseRepository } from '@/repositories/course.repository';
import { PaymentRepository } from '@/repositories/payment.repository';
import { AttendanceRepository } from '@/repositories/attendance.repository';
import { TaskRepository } from '@/repositories/task.repository';
import { AuditRepository } from '@/repositories/audit.repository';
import { UserRepository } from '@/repositories/user.repository';
import { AuthUser } from '@/types';
import { leadSchema, paymentSchema, courseSchema, lectureSchema, taskSchema, attendanceSchema } from '@/validations/schemas';
import { z } from 'zod';
import { hasPermission } from '@/utils/security';

export class CrmService {
  // Helper to assert user has appropriate roles
  private static checkRole(user: AuthUser, allowedRoles: string[]) {
    if (!allowedRoles.includes(user.role)) {
      throw new Error(`Unauthorized: Role '${user.role}' does not have permission to execute this operation.`);
    }
  }

  // --- Leads Module ---
  static async getLeads(
    filters: { status?: string; source?: string; assignedTo?: string; search?: string; page?: number; limit?: number },
    sessionUser: AuthUser
  ) {
    if (!hasPermission(sessionUser, 'leads:read')) {
      throw new Error('Forbidden: Insufficient permissions to view leads.');
    }
    
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Sales staff can only view leads assigned to them, unless they are Admin
    const assignedTo = sessionUser.role === 'SALES' ? sessionUser.id : filters.assignedTo;

    const leads = await LeadRepository.findAll({
      status: filters.status,
      source: filters.source,
      assignedTo,
      search: filters.search,
      skip,
      take: limit,
    });

    const total = await LeadRepository.count({
      status: filters.status,
      source: filters.source,
      assignedTo,
      search: filters.search,
    });

    return { leads, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async createLead(data: z.infer<typeof leadSchema>, sessionUser: AuthUser) {
    if (!hasPermission(sessionUser, 'leads:write')) {
      throw new Error('Forbidden: Insufficient permissions to create leads.');
    }
    const validated = leadSchema.parse(data);

    // Sales staff can only assign leads to themselves
    const assignedTo = sessionUser.role === 'SALES' ? sessionUser.id : (validated.assignedTo || sessionUser.id);

    const lead = await LeadRepository.create({
      name: validated.name,
      phone: validated.phone || null,
      email: validated.email || null,
      source: validated.source || 'Website',
      status: validated.status || 'NEW',
      notes: validated.notes || null,
      followUpDate: validated.followUpDate ? new Date(validated.followUpDate) : null,
      assignedTo,
    } as any);

    await AuditRepository.logAuditTrail({
      userId: sessionUser.id,
      entity: 'LEAD',
      entityId: lead.id,
      action: 'CREATE',
      newValues: lead,
    });

    await AuditRepository.logActivity(sessionUser.id, 'CREATE_LEAD', `Lead ${lead.name} created.`);
    return lead;
  }

  static async updateLead(id: string, data: Partial<z.infer<typeof leadSchema>>, sessionUser: AuthUser) {
    if (!hasPermission(sessionUser, 'leads:write')) {
      throw new Error('Forbidden: Insufficient permissions to update leads.');
    }
    
    const oldLead = await LeadRepository.findById(id);
    if (!oldLead) throw new Error('Lead not found');

    // Sales roles can only edit their own leads unless they are ADMIN
    if (sessionUser.role === 'SALES' && oldLead.assignedTo !== sessionUser.id) {
      throw new Error('Unauthorized: You can only edit leads assigned to you.');
    }

    const updateData: any = { ...data };
    if (data.followUpDate) {
      updateData.followUpDate = new Date(data.followUpDate);
    }

    const updatedLead = await LeadRepository.update(id, updateData);

    await AuditRepository.logAuditTrail({
      userId: sessionUser.id,
      entity: 'LEAD',
      entityId: id,
      action: 'UPDATE',
      oldValues: oldLead,
      newValues: updatedLead,
    });

    // If status changed to PAID, automate Student profile creation!
    if (data.status === 'PAID' && oldLead.status !== 'PAID' && updatedLead.email) {
      const existingUser = await UserRepository.findByEmail(updatedLead.email);
      if (!existingUser) {
        // Create user account for student with a default password (they can reset it)
        const passwordHash = '$2a$10$EIX8a5Q8G5.g7wM9nQW8eOfG7eWzP.nQW8eOfG7eWzP.nQW8eOfG7'; // "student123" encrypted
        const newUser = await UserRepository.create({
          name: updatedLead.name,
          email: updatedLead.email,
          password: passwordHash,
          phone: updatedLead.phone,
          role: 'STUDENT',
        });
        await StudentRepository.create({
          userId: newUser.id,
          level: 'Beginner',
        });
        await AuditRepository.logActivity(
          sessionUser.id,
          'AUTOMATE_STUDENT_CREATION',
          `Automated account creation for lead ${updatedLead.name} because status set to PAID.`
        );
      }
    }

    return updatedLead;
  }

  static async deleteLead(id: string, sessionUser: AuthUser) {
    this.checkRole(sessionUser, ['ADMIN']);
    if (!hasPermission(sessionUser, 'leads:write')) {
      throw new Error('Forbidden: Insufficient permissions to delete leads.');
    }

    const oldLead = await LeadRepository.findById(id);
    if (!oldLead) throw new Error('Lead not found');

    await LeadRepository.delete(id);

    await AuditRepository.logAuditTrail({
      userId: sessionUser.id,
      entity: 'LEAD',
      entityId: id,
      action: 'DELETE',
      oldValues: oldLead,
    });

    return { success: true };
  }

  // --- Students Module ---
  static async getStudents(
    filters: { level?: string; search?: string; page?: number; limit?: number },
    sessionUser: AuthUser
  ) {
    if (!hasPermission(sessionUser, 'students:read')) {
      throw new Error('Forbidden: Insufficient permissions to view students.');
    }
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Instructors can only view students enrolled in courses they instruct
    const instructorId = sessionUser.role === 'INSTRUCTOR' ? sessionUser.id : undefined;

    const students = await StudentRepository.findAll({
      level: filters.level,
      search: filters.search,
      skip,
      take: limit,
      instructorId,
    });

    const total = await StudentRepository.count({
      level: filters.level,
      search: filters.search,
      instructorId,
    });

    return { students, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async getStudentProfile(studentId: string, sessionUser: AuthUser) {
    const student = await StudentRepository.findById(studentId);
    if (!student) throw new Error('Student profile not found');

    // Student can only view their own profile, instructors/sales/admins can view any profile within their scope
    if (sessionUser.role === 'STUDENT') {
      if (student.userId !== sessionUser.id) {
        throw new Error('Unauthorized access to student profile.');
      }
    } else {
      if (!hasPermission(sessionUser, 'students:read')) {
        throw new Error('Forbidden: Insufficient permissions to view student profiles.');
      }
      if (sessionUser.role === 'INSTRUCTOR') {
        const isEnrolledInInstructorsCourse = student.enrollments.some(
          (e) => e.course.instructorId === sessionUser.id
        );
        if (!isEnrolledInInstructorsCourse) {
          throw new Error('Unauthorized: This student is not enrolled in any of your courses.');
        }
      }
    }

    return student;
  }

  static async enrollStudent(studentId: string, courseId: string, sessionUser: AuthUser) {
    if (!hasPermission(sessionUser, 'students:write')) {
      throw new Error('Forbidden: Insufficient permissions to enroll students.');
    }

    // Check if enrollment already exists
    const student = await StudentRepository.findById(studentId);
    if (!student) throw new Error('Student not found');

    const course = await CourseRepository.findById(courseId);
    if (!course) throw new Error('Course not found');

    if (sessionUser.role === 'INSTRUCTOR' && course.instructorId !== sessionUser.id) {
      throw new Error('Unauthorized: You can only enroll students in courses you instruct.');
    }

    const alreadyEnrolled = student.enrollments.some((e) => e.courseId === courseId);
    if (alreadyEnrolled) throw new Error('Student is already enrolled in this course.');

    const enrollment = await StudentRepository.enrollStudent(studentId, courseId);

    await AuditRepository.logActivity(
      sessionUser.id,
      'ENROLL_STUDENT',
      `Enrolled student ${student.user.name} in course ${course.title}.`
    );

    return enrollment;
  }

  static async removeEnrollment(studentId: string, courseId: string, sessionUser: AuthUser) {
    if (!hasPermission(sessionUser, 'students:write')) {
      throw new Error('Forbidden: Insufficient permissions to remove enrollments.');
    }
    this.checkRole(sessionUser, ['ADMIN']);
    
    await StudentRepository.removeEnrollment(studentId, courseId);
    await AuditRepository.logActivity(
      sessionUser.id,
      'REMOVE_ENROLLMENT',
      `Removed student enrollment (Student ID: ${studentId}, Course ID: ${courseId}).`
    );

    return { success: true };
  }

  // --- Payments Module ---
  static async createPayment(data: z.infer<typeof paymentSchema>, sessionUser: AuthUser) {
    if (!hasPermission(sessionUser, 'payments:write')) {
      throw new Error('Forbidden: Insufficient permissions to record payments.');
    }
    this.checkRole(sessionUser, ['ADMIN', 'ACCOUNTANT']);
    const validated = paymentSchema.parse(data);

    const payment = await PaymentRepository.create({
      studentId: validated.studentId,
      amount: validated.amount,
      method: validated.method,
      status: validated.status,
      paidAt: validated.paidAt ? new Date(validated.paidAt) : (validated.status === 'PAID' ? new Date() : null),
    });

    await AuditRepository.logAuditTrail({
      userId: sessionUser.id,
      entity: 'PAYMENT',
      entityId: payment.id,
      action: 'CREATE',
      newValues: payment,
    });

    await AuditRepository.logActivity(
      sessionUser.id,
      'CREATE_PAYMENT',
      `Logged payment of $${payment.amount} for student ID ${payment.studentId}.`
    );

    return payment;
  }

  static async getPayments(
    filters: { studentId?: string; status?: string; method?: string; page?: number; limit?: number },
    sessionUser: AuthUser
  ) {
    if (sessionUser.role !== 'STUDENT' && !hasPermission(sessionUser, 'payments:read')) {
      throw new Error('Forbidden: Insufficient permissions to view payments.');
    }
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    let targetStudentId = filters.studentId;

    // Student can only see their own payments
    if (sessionUser.role === 'STUDENT') {
      const studentProfile = await StudentRepository.findByUserId(sessionUser.id);
      if (!studentProfile) throw new Error('Student profile not found');
      targetStudentId = studentProfile.id;
    }

    const payments = await PaymentRepository.findAll({
      studentId: targetStudentId,
      status: filters.status,
      method: filters.method,
      skip,
      take: limit,
    });

    const total = await PaymentRepository.count({
      studentId: targetStudentId,
      status: filters.status,
      method: filters.method,
    });

    return { payments, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // --- Courses & Lectures Module ---
  static async getCourses(filters: { search?: string }, sessionUser: AuthUser) {
    if (sessionUser.role === 'STUDENT') {
      const profile = await StudentRepository.findByUserId(sessionUser.id);
      if (!profile) throw new Error('Student profile not found');
      const enrolledCourseIds = profile.enrollments.map((e) => e.courseId);
      const allCourses = await CourseRepository.findAll(filters);
      return allCourses.filter((c) => enrolledCourseIds.includes(c.id));
    }

    if (!hasPermission(sessionUser, 'courses:read')) {
      throw new Error('Forbidden: Insufficient permissions to view courses.');
    }

    const instructorId = sessionUser.role === 'INSTRUCTOR' ? sessionUser.id : undefined;
    return CourseRepository.findAll({ ...filters, instructorId });
  }

  static async getCourseDetails(id: string, sessionUser: AuthUser) {
    const course = await CourseRepository.findById(id);
    if (!course) throw new Error('Course not found');

    if (sessionUser.role === 'STUDENT') {
      const profile = await StudentRepository.findByUserId(sessionUser.id);
      if (!profile) throw new Error('Student profile not found');
      const isEnrolled = profile.enrollments.some((e) => e.courseId === id);
      if (!isEnrolled) {
        throw new Error('Unauthorized: You are not enrolled in this course.');
      }
    } else {
      if (!hasPermission(sessionUser, 'courses:read')) {
        throw new Error('Forbidden: Insufficient permissions to view course details.');
      }
      if (sessionUser.role === 'INSTRUCTOR' && course.instructorId !== sessionUser.id) {
        throw new Error('Unauthorized: You can only view details of courses you instruct.');
      }
    }
    return course;
  }

  static async createCourse(data: z.infer<typeof courseSchema>, sessionUser: AuthUser) {
    if (!hasPermission(sessionUser, 'courses:write')) {
      throw new Error('Forbidden: Insufficient permissions to create courses.');
    }
    const validated = courseSchema.parse(data);

    // Instructors can only assign courses to themselves
    const instructorId = sessionUser.role === 'INSTRUCTOR' ? sessionUser.id : (validated.instructorId || sessionUser.id);

    const course = await CourseRepository.create({
      title: validated.title,
      description: validated.description || null,
      price: validated.price,
      thumbnail: validated.thumbnail || '/course-placeholder.jpg',
      instructorId,
    } as any);

    await AuditRepository.logActivity(sessionUser.id, 'CREATE_COURSE', `Created course: ${course.title}`);
    return course;
  }

  static async updateCourse(id: string, data: Partial<z.infer<typeof courseSchema>>, sessionUser: AuthUser) {
    if (!hasPermission(sessionUser, 'courses:write')) {
      throw new Error('Forbidden: Insufficient permissions to update courses.');
    }
    
    const course = await CourseRepository.findById(id);
    if (!course) throw new Error('Course not found');

    if (sessionUser.role === 'INSTRUCTOR' && course.instructorId !== sessionUser.id) {
      throw new Error('Unauthorized: You can only edit courses you instruct.');
    }

    const updated = await CourseRepository.update(id, data);
    await AuditRepository.logActivity(sessionUser.id, 'UPDATE_COURSE', `Updated course: ${updated.title}`);
    return updated;
  }

  static async createLecture(data: z.infer<typeof lectureSchema>, sessionUser: AuthUser) {
    if (!hasPermission(sessionUser, 'courses:write')) {
      throw new Error('Forbidden: Insufficient permissions to create lectures.');
    }
    const validated = lectureSchema.parse(data);

    const course = await CourseRepository.findById(validated.courseId);
    if (!course) throw new Error('Course not found');

    if (sessionUser.role === 'INSTRUCTOR' && course.instructorId !== sessionUser.id) {
      throw new Error('Unauthorized: You can only add lectures to courses you instruct.');
    }

    const lecture = await CourseRepository.createLecture({
      courseId: validated.courseId,
      title: validated.title,
      videoUrl: validated.videoUrl || null,
      fileUrl: validated.fileUrl || null,
      date: new Date(validated.date),
    });

    await AuditRepository.logActivity(sessionUser.id, 'CREATE_LECTURE', `Added lecture ${lecture.title} to course ${course.title}.`);
    return lecture;
  }

  static async deleteLecture(id: string, sessionUser: AuthUser) {
    if (!hasPermission(sessionUser, 'courses:write')) {
      throw new Error('Forbidden: Insufficient permissions to delete lectures.');
    }
    const lecture = await CourseRepository.findLectureById(id);
    if (!lecture) throw new Error('Lecture not found');

    if (sessionUser.role === 'INSTRUCTOR' && lecture.course.instructorId !== sessionUser.id) {
      throw new Error('Unauthorized: You can only delete lectures from courses you instruct.');
    }

    await CourseRepository.deleteLecture(id);
    await AuditRepository.logActivity(sessionUser.id, 'DELETE_LECTURE', `Deleted lecture: ${lecture.title}`);
    return { success: true };
  }

  // --- Attendance Module ---
  static async markAttendance(data: z.infer<typeof attendanceSchema>, sessionUser: AuthUser) {
    if (!hasPermission(sessionUser, 'attendance:write')) {
      throw new Error('Forbidden: Insufficient permissions to log attendance.');
    }
    const validated = attendanceSchema.parse(data);

    const lecture = await CourseRepository.findLectureById(validated.lectureId);
    if (!lecture) throw new Error('Lecture not found');

    if (sessionUser.role === 'INSTRUCTOR' && lecture.course.instructorId !== sessionUser.id) {
      throw new Error('Unauthorized: You can only mark attendance for your own lectures.');
    }

    const results = [];
    for (const mark of validated.marks) {
      const record = await AttendanceRepository.mark({
        studentId: mark.studentId,
        lectureId: validated.lectureId,
        status: mark.status,
        date: lecture.date,
      });
      results.push(record);
    }

    await AuditRepository.logActivity(
      sessionUser.id,
      'MARK_ATTENDANCE',
      `Logged attendance for ${results.length} students in lecture: ${lecture.title}`
    );

    return { success: true, count: results.length };
  }

  static async getAttendanceByLecture(lectureId: string, sessionUser: AuthUser) {
    if (!hasPermission(sessionUser, 'attendance:read')) {
      throw new Error('Forbidden: Insufficient permissions to view attendance.');
    }
    
    const lecture = await CourseRepository.findLectureById(lectureId);
    if (!lecture) throw new Error('Lecture not found');

    if (sessionUser.role === 'INSTRUCTOR' && lecture.course.instructorId !== sessionUser.id) {
      throw new Error('Unauthorized: You can only view attendance for your own lectures.');
    }

    return AttendanceRepository.findByLecture(lectureId);
  }

  static async getAttendanceByStudent(studentId: string, sessionUser: AuthUser) {
    const student = await StudentRepository.findById(studentId);
    if (!student) throw new Error('Student not found');

    // Student can only view their own attendance
    if (sessionUser.role === 'STUDENT') {
      if (student.userId !== sessionUser.id) {
        throw new Error('Unauthorized to view this attendance data.');
      }
    } else {
      if (!hasPermission(sessionUser, 'attendance:read')) {
        throw new Error('Forbidden: Insufficient permissions to view student attendance.');
      }
      if (sessionUser.role === 'INSTRUCTOR') {
        const isEnrolledInInstructorsCourse = student.enrollments.some(
          (e) => e.course.instructorId === sessionUser.id
        );
        if (!isEnrolledInInstructorsCourse) {
          throw new Error('Unauthorized: This student is not enrolled in any of your courses.');
        }
      }
    }

    return AttendanceRepository.findByStudent(studentId);
  }

  // --- Tasks Module ---
  static async getTasks(filters: { status?: string; search?: string }, sessionUser: AuthUser) {
    if (!hasPermission(sessionUser, 'tasks:read')) {
      throw new Error('Forbidden: Insufficient permissions to view tasks.');
    }
    
    // Only Admin can see all tasks; non-admins are restricted to tasks assigned to themselves
    const assignedTo = sessionUser.role === 'ADMIN' ? undefined : sessionUser.id;

    return TaskRepository.findAll({
      assignedTo,
      status: filters.status,
      search: filters.search,
    });
  }

  static async createTask(data: z.infer<typeof taskSchema>, sessionUser: AuthUser) {
    if (!hasPermission(sessionUser, 'tasks:write')) {
      throw new Error('Forbidden: Insufficient permissions to create tasks.');
    }
    this.checkRole(sessionUser, ['ADMIN', 'SALES', 'INSTRUCTOR']);
    const validated = taskSchema.parse(data);

    // Only Admin can customize assignment; others can only assign tasks to themselves
    const assignedTo = sessionUser.role === 'ADMIN' ? (validated.assignedTo || sessionUser.id) : sessionUser.id;

    const task = await TaskRepository.create({
      title: validated.title,
      description: validated.description || null,
      assignedTo: assignedTo,
      status: validated.status || 'TODO',
      deadline: validated.deadline ? new Date(validated.deadline) : null,
    });

    await AuditRepository.logActivity(sessionUser.id, 'CREATE_TASK', `Created task: ${task.title}`);
    return task;
  }

  static async updateTask(id: string, data: Partial<z.infer<typeof taskSchema>>, sessionUser: AuthUser) {
    if (!hasPermission(sessionUser, 'tasks:write') && !hasPermission(sessionUser, 'tasks:read')) {
      throw new Error('Forbidden: Insufficient permissions to update tasks.');
    }
    
    const task = await TaskRepository.findById(id);
    if (!task) throw new Error('Task not found');

    // Enforce that only assigned user or Admin can edit/resolve tasks
    if (sessionUser.role !== 'ADMIN' && task.assignedTo !== sessionUser.id) {
      throw new Error('Unauthorized: You can only update tasks assigned to you.');
    }

    const updateData: any = { ...data };
    if (data.deadline) {
      updateData.deadline = new Date(data.deadline);
    }

    const updated = await TaskRepository.update(id, updateData);
    await AuditRepository.logActivity(sessionUser.id, 'UPDATE_TASK', `Updated task state: ${updated.title}`);
    return updated;
  }

  static async deleteTask(id: string, sessionUser: AuthUser) {
    this.checkRole(sessionUser, ['ADMIN']);
    if (!hasPermission(sessionUser, 'tasks:write')) {
      throw new Error('Forbidden: Insufficient permissions to delete tasks.');
    }

    await TaskRepository.delete(id);
    return { success: true };
  }

  // --- Reports Module ---
  static async getRevenueStats(sessionUser: AuthUser) {
    if (!hasPermission(sessionUser, 'reports:read') && !hasPermission(sessionUser, 'payments:read')) {
      throw new Error('Forbidden: Insufficient permissions to view revenue stats.');
    }
    
    const totalRevenue = await PaymentRepository.sumRevenue();
    const monthlyData = await PaymentRepository.monthlyRevenue();

    // Fetch payments overview
    const recentPayments = await PaymentRepository.findAll({ take: 20 });

    return {
      totalRevenue,
      monthlyData,
      recentPayments,
    };
  }

  // --- Dashboard Overview Stats ---
  static async getDashboardStats(sessionUser: AuthUser) {
    // If user is STUDENT, load student specific dashboard info
    if (sessionUser.role === 'STUDENT') {
      const profile = await StudentRepository.findByUserId(sessionUser.id);
      if (!profile) throw new Error('Student profile not found');

      // Get enrolled courses count
      const enrolledCount = profile.enrollments.length;

      // Get payments summary
      const myPayments = await PaymentRepository.findAll({ studentId: profile.id });
      const paidSum = myPayments
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => sum + p.amount, 0);
      const pendingSum = myPayments
        .filter((p) => p.status === 'PENDING')
        .reduce((sum, p) => sum + p.amount, 0);

      // Get attendance rate
      const myAttendance = await AttendanceRepository.findByStudent(profile.id);
      const totalSessions = myAttendance.length;
      const presentSessions = myAttendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
      const attendanceRate = totalSessions > 0 ? Math.round((presentSessions / totalSessions) * 100) : 100;

      // List my courses
      const myCourses = profile.enrollments.map((e) => e.course);

      return {
        isStudent: true,
        stats: {
          enrolledCount,
          paidSum,
          pendingSum,
          attendanceRate,
        },
        myCourses,
        myPayments: myPayments.slice(0, 5),
        myAttendance: myAttendance.slice(0, 10),
      };
    }

    // Otherwise, generate Full Admin/Staff dashboard
    const hasLeadsRead = hasPermission(sessionUser, 'leads:read');
    const hasStudentsRead = hasPermission(sessionUser, 'students:read');
    const hasPaymentsRead = hasPermission(sessionUser, 'payments:read');
    const hasCoursesRead = hasPermission(sessionUser, 'courses:read');
    const hasTasksRead = hasPermission(sessionUser, 'tasks:read');

    const totalLeads = hasLeadsRead ? await LeadRepository.count() : 0;
    const totalStudents = hasStudentsRead ? await StudentRepository.count() : 0;
    const totalRevenue = hasPaymentsRead ? await PaymentRepository.sumRevenue() : 0;
    
    // Conversion rate: Paid Leads / Total Leads
    const closedPaidLeads = hasLeadsRead ? await LeadRepository.count({ status: 'PAID' }) : 0;
    const conversionRate = (hasLeadsRead && totalLeads > 0) ? Math.round((closedPaidLeads / totalLeads) * 100) : 0;

    const activeCoursesList = hasCoursesRead ? await CourseRepository.findAll() : [];
    const activeCourses = activeCoursesList.length;

    // In-progress tasks count
    let pendingTasks = 0;
    if (hasTasksRead) {
      const assignedTo = sessionUser.role !== 'ADMIN' ? sessionUser.id : undefined;
      const pendingTasksList = await TaskRepository.findAll({ status: 'TODO', assignedTo });
      pendingTasks = pendingTasksList.length + (await TaskRepository.findAll({ status: 'IN_PROGRESS', assignedTo })).length;
    }

    // Graph aggregates
    const revenueByMonth = hasPaymentsRead ? await PaymentRepository.monthlyRevenue() : [];
    
    // Leads by status
    const statusGroups = hasLeadsRead ? await LeadRepository.groupByStatus() : [];
    const leadsByStatus = statusGroups.map((g) => ({
      status: g.status,
      count: g._count._all,
    }));

    // Lists
    const rawActivities = sessionUser.role === 'ADMIN' ? await AuditRepository.findActivities({ limit: 8 }) : [];
    const recentActivities = rawActivities.map((a) => ({
      id: a.id,
      user: a.user?.name || 'System',
      action: a.action,
      details: a.details,
      time: a.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));

    const rawPayments = hasPaymentsRead ? await PaymentRepository.findAll({ take: 5 }) : [];
    const recentPayments = rawPayments.map((p) => ({
      id: p.id,
      student: p.student.user.name,
      amount: p.amount,
      status: p.status,
      date: new Date(p.createdAt).toLocaleDateString(),
    }));

    const rawStudents = hasStudentsRead ? await StudentRepository.findAll({ take: 5 }) : [];
    const recentStudents = rawStudents.map((s) => ({
      id: s.id,
      name: s.user.name,
      email: s.user.email,
      date: new Date(s.joinedAt).toLocaleDateString(),
    }));

    return {
      isStudent: false,
      stats: {
        totalLeads,
        totalStudents,
        totalRevenue,
        conversionRate,
        activeCourses,
        pendingTasks,
      },
      revenueByMonth,
      leadsByStatus,
      recentActivities,
      recentPayments,
      recentStudents,
    };
  }
}
