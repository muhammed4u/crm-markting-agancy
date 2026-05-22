'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { lectureSchema } from '@/validations/schemas';
import { createLectureAction, deleteLectureAction } from '@/actions/crm.actions';
import { useToast } from './ui/toast';
import { Dialog } from './ui/dialog';
import { Spinner } from './ui/loader';
import { EmptyState } from './ui/empty-state';
import { z } from 'zod';
import {
  BookOpen,
  Plus,
  PlayCircle,
  FileText,
  Calendar,
  Trash2,
  CheckSquare,
  ArrowLeft,
  Video,
} from 'lucide-react';
import Link from 'next/link';

type LectureFormValues = z.infer<typeof lectureSchema>;

interface LectureItem {
  id: string;
  title: string;
  videoUrl: string | null;
  fileUrl: string | null;
  date: string;
}

interface CourseDetailsProps {
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnail: string | null;
    instructor: {
      name: string;
      email: string;
    } | null;
  };
  lectures: LectureItem[];
  currentUser: {
    id: string;
    name: string;
    role: string;
  };
}

export function CourseDetailsClient({ course, lectures: initialLectures, currentUser }: CourseDetailsProps) {
  const { showToast } = useToast();
  const [lectures, setLectures] = useState<LectureItem[]>(initialLectures);
  const [addOpen, setAddOpen] = useState(false);
  
  // Video player modal state
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  // Form for adding lecture
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LectureFormValues>({
    resolver: zodResolver(lectureSchema) as any,
    defaultValues: {
      courseId: course.id,
      title: '',
      videoUrl: '',
      fileUrl: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: LectureFormValues) => {
    try {
      const res = await createLectureAction(data);
      if (res.success && res.data) {
        showToast('Lecture added to course curriculum', 'success');
        
        const newLecture = {
          id: res.data.id,
          title: res.data.title,
          videoUrl: res.data.videoUrl,
          fileUrl: res.data.fileUrl,
          date: res.data.date.toISOString(),
        };

        setLectures((prev) => [...prev, newLecture]);
        setAddOpen(false);
        reset();
      } else {
        showToast(res.error || 'Failed to add lecture', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lecture from curriculum?')) return;
    try {
      const res = await deleteLectureAction(id, course.id);
      if (res.success) {
        showToast('Lecture deleted successfully', 'success');
        setLectures((prev) => prev.filter((l) => l.id !== id));
      } else {
        showToast(res.error || 'Failed to delete lecture', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Back Link */}
      <div>
        <Link
          href="/dashboard/courses"
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold mb-4 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Courses Catalog
        </Link>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{course.title}</h2>
            <p className="text-xs text-slate-500 mt-1">
              Lecturer: <span className="font-semibold text-slate-800 dark:text-slate-200">{course.instructor?.name || 'Academic Board'}</span>
            </p>
          </div>

          {(currentUser.role === 'ADMIN' || currentUser.role === 'INSTRUCTOR') && (
            <button
              onClick={() => setAddOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-semibold rounded-xl transition shadow shadow-violet-500/10"
            >
              <Plus className="w-4 h-4" />
              Add Lecture Material
            </button>
          )}
        </div>
      </div>

      {/* Course Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Lectures Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              Curriculum Curriculum Lectures
            </h3>

            {lectures.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Curriculum is empty"
                description="No lecture sessions or materials are logged for this course program."
                actionText={currentUser.role === 'ADMIN' || currentUser.role === 'INSTRUCTOR' ? 'Schedule First Lecture' : undefined}
                onAction={currentUser.role === 'ADMIN' || currentUser.role === 'INSTRUCTOR' ? () => setAddOpen(true) : undefined}
              />
            ) : (
              <div className="space-y-4">
                {lectures.map((lec, index) => (
                  <div
                    key={lec.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 transition"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 font-bold text-xs flex items-center justify-center flex-shrink-0 select-none">
                        {index + 1}
                      </span>
                      
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{lec.title}</p>
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Session: {new Date(lec.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {/* Play Video */}
                      {lec.videoUrl && (
                        <button
                          onClick={() => setPlayingVideo(lec.videoUrl)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold rounded-lg transition"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          Watch Video
                        </button>
                      )}

                      {/* Download Materials */}
                      {lec.fileUrl && (
                        <a
                          href={lec.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg transition"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Checklist PDF
                        </a>
                      )}

                      {/* Attendance Marking (Admins & Instructors only) */}
                      {(currentUser.role === 'ADMIN' || currentUser.role === 'INSTRUCTOR') && (
                        <Link
                          href={`/dashboard/attendance?lectureId=${lec.id}&courseId=${course.id}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-[10px] font-bold rounded-lg transition"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          Mark Roll
                        </Link>
                      )}

                      {/* Drop Lecture (Admin & Instructor only) */}
                      {(currentUser.role === 'ADMIN' || currentUser.role === 'INSTRUCTOR') && (
                        <button
                          onClick={() => handleDelete(lec.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition"
                          title="Delete Lecture"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Course Metadata & Media player */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-4 border-b border-slate-100 dark:border-slate-800">
              Syllabus Summary
            </h3>

            <div className="h-36 relative bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
              <img
                src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-slate-400">Course description</span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/20 p-3 rounded-xl">
                {course.description}
              </p>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-400 font-semibold">Enrollment Fee</span>
              <span className="font-bold text-slate-900 dark:text-white text-base">${course.price}</span>
            </div>
          </div>
        </div>

      </div>

      {/* --- ADD LECTURE DIALOG MODAL --- */}
      <Dialog isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Course Lecture" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* hidden Course ID */}
          <input type="hidden" {...register('courseId')} />

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Lecture Topic Title *</label>
            <input
              type="text"
              placeholder="e.g. Scaling Facebook Ads using Lookalikes"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
              {...register('title')}
            />
            {errors.title && <p className="text-[11px] text-rose-500 font-semibold">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Video Url */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Lecture Video Link (MP4)</label>
              <input
                type="text"
                placeholder="https://..."
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
                {...register('videoUrl')}
              />
              {errors.videoUrl && <p className="text-[11px] text-rose-500 font-semibold">{errors.videoUrl.message}</p>}
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Schedule Date *</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
                {...register('date')}
              />
              {errors.date && <p className="text-[11px] text-rose-500 font-semibold">{errors.date.message}</p>}
            </div>
          </div>

          {/* File Material Url */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">PDF Materials Link</label>
            <input
              type="text"
              placeholder="https://..."
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
              {...register('fileUrl')}
            />
            {errors.fileUrl && <p className="text-[11px] text-rose-500 font-semibold">{errors.fileUrl.message}</p>}
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
              {isSubmitting ? <Spinner className="w-3.5 h-3.5 border-t-white" /> : 'Log Lecture'}
            </button>
          </div>
        </form>
      </Dialog>

      {/* --- VIDEO PLAYER DIALOG MODAL --- */}
      <Dialog isOpen={!!playingVideo} onClose={() => setPlayingVideo(null)} title="Lecture Material video Player" size="lg">
        {playingVideo && (
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative border border-slate-800">
              <video
                src={playingVideo}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[10px] text-slate-500 leading-normal text-center">
              Academy secure media player • AES token authorized
            </p>
          </div>
        )}
      </Dialog>
    </div>
  );
}
