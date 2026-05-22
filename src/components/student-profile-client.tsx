'use client';

import React, { useState } from 'react';
import { enrollStudentAction, removeEnrollmentAction } from '@/actions/crm.actions';
import { useToast } from './ui/toast';
import { Spinner } from './ui/loader';
import {
  GraduationCap,
  Calendar,
  CreditCard,
  Plus,
  Trash2,
  TrendingUp,
  Percent,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface CourseItem {
  id: string;
  title: string;
  price: number;
}

interface StudentProfileProps {
  student: {
    id: string;
    bio: string | null;
    level: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
    };
    enrollments: {
      id: string;
      status: string;
      course: {
        id: string;
        title: string;
        price: number;
      };
    }[];
  };
  attendance: {
    id: string;
    status: string;
    date: string;
    lecture: {
      title: string;
      course: {
        title: string;
      };
    };
  }[];
  payments: {
    id: string;
    amount: number;
    method: string;
    status: string;
    paidAt: string | null;
    createdAt: string;
  }[];
  allCourses: CourseItem[];
  hasPaymentsRead?: boolean;
}

export function StudentProfileClient({ student, attendance, payments, allCourses, hasPaymentsRead = false }: StudentProfileProps) {
  const { showToast } = useToast();
  const [enrollments, setEnrollments] = useState(student.enrollments);
  const [studentPayments, setStudentPayments] = useState(payments);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Calculate stats
  const totalInvoiced = enrollments.reduce((acc, curr) => acc + curr.course.price, 0);
  const totalPaid = studentPayments
    .filter((p) => p.status === 'PAID')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBalance = totalInvoiced - totalPaid;

  const totalClasses = attendance.length;
  const presentClasses = attendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;

  // 2. Filter courses available for new enrollment
  const enrolledCourseIds = enrollments.map((e) => e.course.id);
  const availableCourses = allCourses.filter((c) => !enrolledCourseIds.includes(c.id));

  // 3. Handle Enrollment
  const handleEnroll = async () => {
    if (!selectedCourseId) {
      showToast('Please select a course to enroll.', 'info');
      return;
    }
    setLoading(true);
    try {
      const res = await enrollStudentAction(student.id, selectedCourseId);
      if (res.success && res.data) {
        showToast('Student enrolled successfully!', 'success');
        
        // Add new enrollment locally
        const course = allCourses.find((c) => c.id === selectedCourseId)!;
        const newEnrollment = {
          id: res.data.id,
          status: 'ACTIVE',
          course: {
            id: course.id,
            title: course.title,
            price: course.price,
          },
        };
        setEnrollments((prev) => [...prev, newEnrollment]);
        setSelectedCourseId('');
      } else {
        showToast(res.error || 'Failed to enroll student', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle dropping course
  const handleDrop = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to drop this student from this course? This will suspend their syllabus access.')) return;
    setLoading(true);
    try {
      const res = await removeEnrollmentAction(student.id, courseId);
      if (res.success) {
        showToast('Enrollment removed successfully', 'success');
        setEnrollments((prev) => prev.filter((e) => e.course.id !== courseId));
      } else {
        showToast(res.error || 'Failed to drop course', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/students"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold mb-4 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Students Directory
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {student.user.name}
              </h2>
              <p className="text-xs text-slate-500">Student Profile & Progress Summary File</p>
            </div>
          </div>

          <span className="inline-block text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-violet-600/10 text-violet-600 dark:text-violet-400 border border-violet-500/10 tracking-widest">
            {student.level} Level
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className={`grid grid-cols-1 ${hasPaymentsRead ? 'sm:grid-cols-3' : 'sm:grid-cols-1'} gap-6`}>
        {/* Stat 1: Attendance Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Attendance Rate</span>
            <Percent className="w-4 h-4 text-violet-500" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{attendanceRate}%</p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Present in {presentClasses} out of {totalClasses} classes
            </p>
          </div>
        </div>

        {hasPaymentsRead && (
          <>
            {/* Stat 2: Invoiced Revenue */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Program Cost</span>
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-2.5">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">${totalInvoiced}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Cumulative price of enrolled courses</p>
              </div>
            </div>

            {/* Stat 3: Balance Pending */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Outstanding Balance</span>
                <CreditCard className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2.5">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">${remainingBalance}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Paid: <span className="text-emerald-500 font-semibold">${totalPaid}</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Details block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Contact, Bio & Enrollments (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrollments management */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              Academic Enrollments
            </h3>

            {/* Enrollments List */}
            <div className="space-y-4">
              {enrollments.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">Not enrolled in any courses.</p>
              ) : (
                enrollments.map((enroll) => (
                  <div
                    key={enroll.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/50"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{enroll.course.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Cost: ${enroll.course.price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {enroll.status}
                      </span>
                      <button
                        onClick={() => handleDrop(enroll.course.id)}
                        disabled={loading}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                        title="Unenroll student"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* New Enrollment Picker */}
            {availableCourses.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80">
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  Enroll Student in New Course
                </label>
                <div className="flex gap-3">
                  <select
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none focus:border-violet-500 cursor-pointer"
                  >
                    <option value="">-- Choose Course Syllabus --</option>
                    {availableCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} (${c.price})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleEnroll}
                    disabled={loading || !selectedCourseId}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-1 shadow-sm transition"
                  >
                    {loading ? <Spinner className="w-3 h-3 border-t-white" /> : <Plus className="w-4 h-4" />}
                    Add Enrollment
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Attendance logs history */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              Attendance History Sheets
            </h3>

            <div className="space-y-3">
              {attendance.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">No attendance records documented.</p>
              ) : (
                attendance.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        {att.lecture.title}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {att.lecture.course.title} • {new Date(att.date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full select-none ${
                      att.status === 'PRESENT'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : att.status === 'LATE'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}>
                      {att.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Details Summary & Transactions */}
        <div className="space-y-6">
          {/* Profile metadata details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-4 border-b border-slate-100 dark:border-slate-800">
              Student File Details
            </h3>
            
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400">Bio Narrative</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal bg-slate-50 dark:bg-slate-800/20 p-3 rounded-xl">
                {student.bio || 'No profile bio provided yet.'}
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Registered Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Phone Contact</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{student.user.phone}</span>
              </div>
            </div>
          </div>

          {/* Transactions / Payments tracking */}
          {hasPaymentsRead && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                Financial Timeline
              </h3>

              <div className="space-y-3.5">
                {studentPayments.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">No transactions posted.</p>
                ) : (
                  studentPayments.map((pay) => (
                    <div
                      key={pay.id}
                      className="flex justify-between items-center p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/50 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">${pay.amount}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{pay.method} • {new Date(pay.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full select-none ${
                        pay.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : pay.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {pay.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
