import { z } from 'zod';

// --- Authentication ---
export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  phone: z.string().optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'SALES', 'INSTRUCTOR', 'ACCOUNTANT', 'STUDENT'], {
    message: 'Please select a valid role',
  }),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  token: z.string().min(1, { message: 'Token is required' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ['confirmPassword'],
});

// --- Leads ---
export const leadSchema = z.object({
  name: z.string().min(2, { message: 'Lead name must be at least 2 characters' }),
  phone: z.string().optional().nullable().or(z.literal('')),
  email: z.string().email({ message: 'Invalid email address' }).optional().nullable().or(z.literal('')),
  source: z.string().optional().nullable().or(z.literal('')),
  status: z.enum(['NEW', 'CONTACTED', 'INTERESTED', 'PAID', 'CLOSED']).default('NEW'),
  notes: z.string().optional().nullable().or(z.literal('')),
  followUpDate: z.string().optional().nullable().or(z.literal('')), // HTML date input yields string
  assignedTo: z.string().optional().nullable().or(z.literal('')),
});

// --- Students ---
export const studentSchema = z.object({
  userId: z.string().min(1, { message: 'User reference is required' }),
  bio: z.string().optional().nullable().or(z.literal('')),
  level: z.string().optional().nullable().or(z.literal('')),
});

// --- Courses ---
export const courseSchema = z.object({
  title: z.string().min(2, { message: 'Course title must be at least 2 characters' }),
  description: z.string().optional().nullable().or(z.literal('')),
  price: z.coerce.number().min(0, { message: 'Price must be a positive number' }),
  thumbnail: z.string().optional().nullable().or(z.literal('')),
  instructorId: z.string().optional().nullable().or(z.literal('')),
});

// --- Lectures ---
export const lectureSchema = z.object({
  courseId: z.string().min(1, { message: 'Course reference is required' }),
  title: z.string().min(2, { message: 'Lecture title must be at least 2 characters' }),
  videoUrl: z.string().url({ message: 'Invalid video URL' }).optional().nullable().or(z.literal('')),
  fileUrl: z.string().optional().nullable().or(z.literal('')),
  date: z.string().min(1, { message: 'Lecture date is required' }),
});

// --- Payments ---
export const paymentSchema = z.object({
  studentId: z.string().min(1, { message: 'Student selection is required' }),
  amount: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().positive({ message: 'Amount must be greater than zero' })
  ),
  method: z.string().min(1, { message: 'Payment method is required' }), // e.g. Cash, Credit Card, bank transfer
  status: z.enum(['PAID', 'PENDING', 'OVERDUE']).default('PAID'),
  paidAt: z.string().optional().nullable().or(z.literal('')),
});

// --- Attendance ---
export const attendanceSchema = z.object({
  courseId: z.string().min(1, { message: 'Course selection is required' }),
  lectureId: z.string().min(1, { message: 'Lecture selection is required' }),
  marks: z.array(
    z.object({
      studentId: z.string().min(1, { message: 'Student selection is required' }),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
    })
  ),
});

// --- Tasks ---
export const taskSchema = z.object({
  title: z.string().min(2, { message: 'Task title must be at least 2 characters' }),
  description: z.string().optional().nullable().or(z.literal('')),
  assignedTo: z.string().optional().nullable().or(z.literal('')),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']).default('TODO'),
  deadline: z.string().optional().nullable().or(z.literal('')),
});
