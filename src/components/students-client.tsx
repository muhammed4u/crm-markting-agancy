'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, GraduationCap, ChevronRight, BookOpen, Star } from 'lucide-react';
import { EmptyState } from './ui/empty-state';

interface StudentListItem {
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
    course: {
      id: string;
      title: string;
    };
  }[];
}

interface StudentsClientProps {
  initialStudents: StudentListItem[];
}

export function StudentsClient({ initialStudents }: StudentsClientProps) {
  const [students, setStudents] = useState<StudentListItem[]>(initialStudents);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');

  // Filter students client-side for immediate feedback
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.user.name.toLowerCase().includes(search.toLowerCase()) ||
      student.user.phone.includes(search) ||
      student.user.email.toLowerCase().includes(search.toLowerCase());

    const matchesLevel = levelFilter === 'ALL' || student.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Academy Student Directory</h2>
        <p className="text-xs text-slate-500 mt-1">View active profiles, enrollments, and check educational progression.</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search students by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 rounded-xl focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        {/* Level Filters */}
        <div className="flex gap-2 w-full md:w-auto">
          {['ALL', 'Beginner', 'Intermediate', 'Advanced'].map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer ${
                levelFilter === level
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow shadow-slate-950/10'
                  : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden animate-scale-in">
        {filteredStudents.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No students found"
            description="No student profiles match your search criteria. Note: Students are automatically created when a lead is marked as PAID or when self-registering."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50 select-none">
                  <th className="p-4 pl-6">Student Info</th>
                  <th className="p-4">Contact Detail</th>
                  <th className="p-4">Academy Level</th>
                  <th className="p-4">Courses Enrolled</th>
                  <th className="p-4 text-right pr-6">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((student, idx) => {
                  const delayClass = idx < 6 ? ["delay-50", "delay-100", "delay-150", "delay-200", "delay-250", "delay-300"][idx] : "";
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-200 text-slate-800 dark:text-slate-200 animate-fade-in-up ${delayClass}`}
                    >
                      {/* Student name & bio */}
                      <td className="p-4 pl-6">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{student.user.name}</p>
                        {student.bio && (
                          <p className="text-[10px] text-slate-500 mt-1 max-w-[220px] truncate leading-normal" title={student.bio}>
                            {student.bio}
                          </p>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="p-4 text-xs font-medium space-y-0.5">
                        <p>{student.user.email}</p>
                        <p className="text-slate-500">{student.user.phone}</p>
                      </td>

                      {/* Academy Level */}
                      <td className="p-4 text-xs">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full select-none ${
                          student.level === 'Advanced'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : student.level === 'Intermediate'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                        }`}>
                          <Star className="w-3 h-3 fill-current" />
                          {student.level}
                        </span>
                      </td>

                      {/* Courses */}
                      <td className="p-4 text-xs">
                        {student.enrollments.length === 0 ? (
                          <span className="text-slate-400 text-[10px] font-medium">No enrollments</span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {student.enrollments.map((enroll) => (
                              <span
                                key={enroll.id}
                                className="inline-block text-[9px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-md"
                              >
                                {enroll.course.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* View Details button */}
                      <td className="p-4 text-right pr-6">
                        <Link
                          href={`/dashboard/students/${student.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-all duration-200 active:scale-95 group/btn"
                        >
                          Inspect
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
