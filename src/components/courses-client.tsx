'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseSchema } from '@/validations/schemas';
import { createCourseAction } from '@/actions/crm.actions';
import { useToast } from './ui/toast';
import { Dialog } from './ui/dialog';
import { Spinner } from './ui/loader';
import { EmptyState } from './ui/empty-state';
import { z } from 'zod';
import {
  BookOpen,
  Plus,
  Search,
  DollarSign,
  User,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { Course, AuthUser, User as DBUser } from '@/types';

type CourseFormValues = z.infer<typeof courseSchema>;

interface InstructorOption {
  id: string;
  name: string;
}

interface CoursesClientProps {
  initialCourses: Course[];
  instructors: InstructorOption[];
  currentUser: AuthUser;
}

export function CoursesClient({ initialCourses, instructors, currentUser }: CoursesClientProps) {
  const { showToast } = useToast();
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  // Form for creating course
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      price: 1500,
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
      instructorId: currentUser.role === 'INSTRUCTOR' ? currentUser.id : '',
    },
  });

  const onSubmit = async (data: CourseFormValues) => {
    try {
      const res = await createCourseAction(data);
      if (res.success && res.data) {
        showToast('Syllabus course created', 'success');
        
        // Match instructor name
        const inst = instructors.find((i) => i.id === data.instructorId);
        const newCourse = {
          ...res.data,
          instructor: {
            name: inst ? inst.name : currentUser.name,
          },
        };
        
        setCourses((prev: any) => [...prev, newCourse]);
        setAddOpen(false);
        reset();
      } else {
        showToast(res.error || 'Failed to create course', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Academy Study Programs</h2>
          <p className="text-xs text-slate-500 mt-1">Manage lectures, curriculums, video logs, and lesson downloads.</p>
        </div>

        {/* Trigger (Admin & Instructor only) */}
        {(currentUser.role === 'ADMIN' || currentUser.role === 'INSTRUCTOR') && (
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-violet-500/10"
          >
            <Plus className="w-4 h-4" />
            Add Course Syllabus
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search course syllabuses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 rounded-xl focus:outline-none focus:border-violet-500 transition shadow-sm"
        />
      </div>

      {/* Courses Cards Grid */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses registered"
          description="Academy catalog is currently empty. Add courses to start planning academic schedules."
          actionText={currentUser.role === 'ADMIN' || currentUser.role === 'INSTRUCTOR' ? 'Create First Course' : undefined}
          onAction={currentUser.role === 'ADMIN' || currentUser.role === 'INSTRUCTOR' ? () => setAddOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              {/* Thumbnail */}
              <div className="h-44 relative bg-slate-100 dark:bg-slate-800">
                <img
                  src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                  alt={c.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base line-clamp-1">{c.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Instructor */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <User className="w-4 h-4 text-violet-500" />
                    <span>Lecturer: {c.instructor?.name || 'Assigned Instructor'}</span>
                  </div>

                  {/* Price & Button wrapper */}
                  <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-slate-800">
                    <p className="font-extrabold text-slate-950 dark:text-white text-lg">
                      ${c.price}
                    </p>
                    
                    <Link
                      href={`/dashboard/courses/${c.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-violet-600 hover:text-white dark:hover:bg-violet-600 text-xs font-bold rounded-lg transition"
                    >
                      Enter
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD COURSE DIALOG MODAL --- */}
      <Dialog isOpen={addOpen} onClose={() => setAddOpen(false)} title="Create Academy Study Program" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Course Syllabus Title *</label>
            <input
              type="text"
              placeholder="e.g. SEO Masterclass"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
              {...register('title')}
            />
            {errors.title && <p className="text-[11px] text-rose-500 font-semibold">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Program Description *</label>
            <textarea
              placeholder="Provide a detailed description of modules and study topics..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition resize-none"
              {...register('description')}
            />
            {errors.description && <p className="text-[11px] text-rose-500 font-semibold">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Tuition Price ($) *</label>
              <input
                type="number"
                placeholder="1500"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && <p className="text-[11px] text-rose-500 font-semibold">{errors.price.message}</p>}
            </div>

            {/* Select Instructor */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Assign Lead Lecturer *</label>
              <select
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
                {...register('instructorId')}
              >
                <option value="">-- Choose Instructor --</option>
                {instructors.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
              {errors.instructorId && <p className="text-[11px] text-rose-500 font-semibold">{errors.instructorId.message}</p>}
            </div>
          </div>

          {/* Thumbnail */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Cover Thumbnail URL</label>
            <input
              type="text"
              placeholder="https://..."
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
              {...register('thumbnail')}
            />
            {errors.thumbnail && <p className="text-[11px] text-rose-500 font-semibold">{errors.thumbnail.message}</p>}
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl shadow transition"
            >
              {isSubmitting ? <Spinner className="w-3.5 h-3.5 border-t-white" /> : 'Create Course'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
