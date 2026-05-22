export type UserRole = 'ADMIN' | 'SALES' | 'INSTRUCTOR' | 'ACCOUNTANT' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  source?: string | null;
  status: 'NEW' | 'CONTACTED' | 'INTERESTED' | 'PAID' | 'CLOSED';
  notes?: string | null;
  followUpDate?: Date | null;
  assignedTo?: string | null;
  assignedToUser?: User | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  id: string;
  userId: string;
  user: User;
  bio?: string | null;
  level?: string | null; // e.g., Beginner, Intermediate, Advanced
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  title: string;
  description?: string | null;
  price: number;
  thumbnail?: string | null;
  instructorId?: string | null;
  instructor?: User | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lecture {
  id: string;
  courseId: string;
  course?: Course;
  title: string;
  videoUrl?: string | null;
  fileUrl?: string | null;
  date: Date;
  createdAt: Date;
}

export interface Enrollment {
  id: string;
  studentId: string;
  student?: Student;
  courseId: string;
  course?: Course;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  createdAt: Date;
}

export interface Payment {
  id: string;
  studentId: string;
  student?: Student;
  amount: number;
  method: string; // e.g., Cash, Credit Card, Bank Transfer, Instapay
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paidAt?: Date | null;
  createdAt: Date;
}

export interface Attendance {
  id: string;
  studentId: string;
  student?: Student;
  lectureId: string;
  lecture?: Lecture;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  date: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  assignedTo?: string | null;
  assignedToUser?: User | null;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  deadline?: Date | null;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  userId?: string | null;
  user?: User | null;
  action: string;
  details: string;
  createdAt: Date;
}

export interface AuditTrail {
  id: string;
  userId?: string | null;
  user?: User | null;
  entity: string;
  entityId: string;
  action: string;
  oldValues?: string | null;
  newValues?: string | null;
  createdAt: Date;
}

// --- Auth Types ---
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  permissions: string[];
}

export interface Session {
  user: AuthUser;
}

// --- Analytics Types ---
export interface DashboardStats {
  totalLeads: number;
  totalStudents: number;
  totalRevenue: number;
  conversionRate: number; // percentage
  activeCourses: number;
  pendingTasks: number;
  revenueByMonth: { month: string; amount: number }[];
  leadsByStatus: { status: string; count: number }[];
  recentActivities: { id: string; user: string; action: string; time: string }[];
  recentPayments: { id: string; student: string; amount: number; date: string; status: string }[];
  recentStudents: { id: string; name: string; email: string; date: string }[];
}
