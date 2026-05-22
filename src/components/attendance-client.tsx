'use client';

import React, { useState, useEffect } from 'react';
import { markAttendanceAction } from '@/actions/crm.actions';
import { useToast } from './ui/toast';
import { Spinner } from './ui/loader';
import { EmptyState } from './ui/empty-state';
import {
  CalendarDays,
  CheckCircle,
  UserCheck,
  ClipboardCheck,
  AlertCircle,
  Clock,
} from 'lucide-react';

interface StudentListItem {
  id: string;
  name: string;
}

interface LectureOption {
  id: string;
  title: string;
  date: string;
}

interface CourseOption {
  id: string;
  title: string;
  lectures: LectureOption[];
  enrollments: {
    student: {
      id: string;
      user: {
        name: string;
      };
    };
  }[];
}

interface StudentAttendanceRecord {
  id: string;
  status: string;
  date: string;
  lecture: {
    title: string;
    course: {
      title: string;
    };
  };
}

interface AttendanceClientProps {
  courses: CourseOption[];
  studentRecords: StudentAttendanceRecord[];
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
}

export function AttendanceClient({ courses, studentRecords, currentUser }: AttendanceClientProps) {
  const { showToast } = useToast();
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedLectureId, setSelectedLectureId] = useState('');
  
  // List of students to mark
  const [students, setStudents] = useState<StudentListItem[]>([]);
  // Attendance marks state: mapping of studentId -> status ('PRESENT' | 'ABSENT' | 'LATE')
  const [attendanceMarks, setAttendanceMarks] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});
  const [loading, setLoading] = useState(false);

  // 1. Get lectures for selected course
  const activeCourse = courses.find((c) => c.id === selectedCourseId);
  const lectures = activeCourse ? activeCourse.lectures : [];

  // 2. Load students when course is selected
  useEffect(() => {
    if (activeCourse) {
      const list = activeCourse.enrollments.map((e) => ({
        id: e.student.id,
        name: e.student.user.name,
      }));
      setStudents(list);

      // Initialize all marks to PRESENT by default
      const initialMarks: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
      list.forEach((s) => {
        initialMarks[s.id] = 'PRESENT';
      });
      setAttendanceMarks(initialMarks);
    } else {
      setStudents([]);
      setAttendanceMarks({});
    }
    setSelectedLectureId('');
  }, [selectedCourseId, activeCourse]);

  // 3. Toggle single mark
  const handleMarkChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setAttendanceMarks((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // 4. Submit Marks
  const handleSubmitMarks = async () => {
    if (!selectedCourseId || !selectedLectureId) {
      showToast('Please select Course and Lecture first.', 'info');
      return;
    }

    setLoading(true);
    try {
      // Map states to API request format
      const marksPayload = Object.entries(attendanceMarks).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      const res = await markAttendanceAction({
        courseId: selectedCourseId,
        lectureId: selectedLectureId,
        marks: marksPayload,
      });

      if (res.success) {
        showToast('Attendance roll submitted successfully!', 'success');
      } else {
        showToast(res.error || 'Failed to save attendance', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Render view depending on role
  if (currentUser.role === 'STUDENT') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Your Attendance Sheets</h2>
          <p className="text-xs text-slate-500 mt-1">Check your historical records and class engagement percentages.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
          {studentRecords.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No class logs logged"
              description="Your instructors have not logged any attendance logs for your enrollments yet."
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {studentRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-900 dark:text-white">{rec.lecture.title}</p>
                    <p className="text-[10px] text-slate-500">
                      {rec.lecture.course.title} • Session: {new Date(rec.date).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2.5 py-0.5 rounded-full select-none ${
                    rec.status === 'PRESENT'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : rec.status === 'LATE'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                    {rec.status === 'PRESENT' && <CheckCircle className="w-3.5 h-3.5" />}
                    {rec.status === 'LATE' && <Clock className="w-3.5 h-3.5" />}
                    {rec.status === 'ABSENT' && <AlertCircle className="w-3.5 h-3.5" />}
                    {rec.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Teacher Roll Mark panel
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Attendance Sheets Roll Call</h2>
        <p className="text-xs text-slate-500 mt-1">Select class program, load student database, and mark status.</p>
      </div>

      {/* Selectors card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Choose Course */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Target Study Program *</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
          >
            <option value="">-- Choose Syllabus Program --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Choose Lecture */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Academy Lecture Session *</label>
          <select
            value={selectedLectureId}
            disabled={!selectedCourseId}
            onChange={(e) => setSelectedLectureId(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer disabled:opacity-50"
          >
            <option value="">-- Choose Scheduled Lecture --</option>
            {lectures.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title} ({new Date(l.date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students list for roll call */}
      {selectedLectureId && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden animate-zoom-in">
          {students.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No students enrolled"
              description="This course currently has no active student enrollments. Add enrollments first before marking attendance."
            />
          ) : (
            <div>
              {/* Header Panel */}
              <div className="p-4 pl-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center select-none">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student Name</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pr-6">Roll Call Status</span>
              </div>

              {/* Student Rows */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 pl-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{student.name}</span>
                    
                    {/* Toggle Buttons */}
                    <div className="flex gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                      {(['PRESENT', 'LATE', 'ABSENT'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleMarkChange(student.id, status)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all duration-200 ${
                            attendanceMarks[student.id] === status
                              ? status === 'PRESENT'
                                ? 'bg-emerald-500 text-white shadow'
                                : status === 'LATE'
                                ? 'bg-amber-500 text-white shadow'
                                : 'bg-rose-500 text-white shadow'
                              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="p-4 bg-slate-50/30 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={handleSubmitMarks}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-semibold rounded-xl shadow transition"
                >
                  {loading ? (
                    <>
                      <Spinner className="w-3.5 h-3.5 border-t-white" />
                      Saving Roll Call...
                    </>
                  ) : (
                    <>
                      <ClipboardCheck className="w-4 h-4" />
                      Save Attendance Logs
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
