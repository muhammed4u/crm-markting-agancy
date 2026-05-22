'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema } from '@/validations/schemas';
import { createTaskAction, updateTaskAction, deleteTaskAction } from '@/actions/crm.actions';
import { useToast } from './ui/toast';
import { Dialog } from './ui/dialog';
import { Spinner } from './ui/loader';
import { EmptyState } from './ui/empty-state';
import { z } from 'zod';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Task, AuthUser, User as DBUser } from '@/types';

type TaskFormValues = z.infer<typeof taskSchema>;

interface UserOption {
  id: string;
  name: string;
}

interface TasksClientProps {
  initialTasks: Task[];
  staffUsers: UserOption[];
  currentUser: AuthUser;
}

export function TasksClient({ initialTasks, staffUsers, currentUser }: TasksClientProps) {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form for creating task
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      assignedTo: currentUser.id,
    },
  });

  const onSubmit = async (data: TaskFormValues) => {
    try {
      const res = await createTaskAction(data);
      if (res.success && res.data) {
        showToast('Task added to schedule board', 'success');
        
        // Find assigned user name
        const assignee = staffUsers.find((u) => u.id === data.assignedTo);
        const newTask = {
          ...res.data,
          assignedToUser: assignee ? { name: assignee.name } : null,
        };

        setTasks((prev: any) => [newTask, ...prev]);
        setStatusFilter('ALL'); // Reset filter to ALL so the new task is guaranteed to show up immediately
        setAddOpen(false);
        reset();
      } else {
        showToast(res.error || 'Failed to create task', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Toggle task status quickly
  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      const res = await updateTaskAction(task.id, {
        title: task.title,
        status: nextStatus,
      });

      if (res.success && res.data) {
        showToast(`Task marked as ${nextStatus.toLowerCase()}`, 'success');
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t))
        );
      } else {
        showToast(res.error || 'Failed to update task status', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Delete Task
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await deleteTaskAction(id);
      if (res.success) {
        showToast('Task removed from board', 'success');
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } else {
        showToast(res.error || 'Failed to delete task', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Filtering
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Academy Staff Chore Checklist</h2>
          <p className="text-xs text-slate-500 mt-1">Assign duties, check milestones, and track marketing operations.</p>
        </div>

        {/* Trigger (staff & admin only) */}
        {currentUser.role !== 'STUDENT' && (
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-violet-500/10"
          >
            <Plus className="w-4 h-4" />
            Delegate Task
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 rounded-xl focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        {/* Status filters */}
        <div className="flex gap-2 w-full md:w-auto">
          {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer ${
                statusFilter === status
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow shadow-slate-950/10'
                  : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Layout */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="Task checklist is clear"
          description="Everything is currently completed or no items are assigned."
          actionText={currentUser.role !== 'STUDENT' ? 'Add Task Checklist' : undefined}
          onAction={currentUser.role !== 'STUDENT' ? () => setAddOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task, idx) => {
            const delayClass = idx < 6 ? ["delay-50", "delay-100", "delay-150", "delay-200", "delay-250", "delay-300"][idx] : "";
            return (
              <div
                key={task.id}
                className={`p-5 bg-white dark:bg-slate-900 border rounded-2xl shadow-sm transition-all duration-200 flex gap-4 items-start animate-scale-in ${delayClass} ${
                  task.status === 'COMPLETED'
                    ? 'border-slate-100 dark:border-slate-800 opacity-60'
                    : 'border-slate-150 dark:border-slate-800 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700/80 hover:-translate-y-0.5'
                }`}
              >
                {/* Checkbox trigger */}
                <button
                  type="button"
                  onClick={() => handleToggleStatus(task)}
                  className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150 active:scale-75 mt-0.5 cursor-pointer ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 dark:border-slate-700 hover:border-violet-500 hover:bg-violet-500/5'
                  }`}
                >
                  {task.status === 'COMPLETED' && <CheckCircle className="w-3.5 h-3.5 stroke-[3] animate-zoom-in" />}
                </button>

                {/* Task Details */}
                <div className="flex-1 space-y-3.5">
                  <div className="space-y-1">
                    <h4 className={`text-xs font-semibold leading-snug text-slate-900 dark:text-white transition-colors duration-200 ${
                      task.status === 'COMPLETED' ? 'line-through text-slate-400' : ''
                    }`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 font-semibold">
                    {/* Assigned to */}
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-violet-500" />
                      <span>Owner: {task.assignedToUser?.name || 'Academy Staff'}</span>
                    </div>

                    {/* Delete (Admin or creator) */}
                    {(currentUser.role === 'ADMIN' || currentUser.id === task.assignedTo) && (
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors active:scale-90 cursor-pointer"
                        title="Remove Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- DELEGATE TASK DIALOG --- */}
      <Dialog isOpen={addOpen} onClose={() => setAddOpen(false)} title="Delegate Task Assignment" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Task Title *</label>
            <input
              type="text"
              placeholder="e.g. Call prospect Ahmed for enrollment confirm"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
              {...register('title')}
            />
            {errors.title && <p className="text-[11px] text-rose-500 font-semibold">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Detailed Instructions</label>
            <textarea
              placeholder="Record any details, phone conversation prompts, or target dates..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition resize-none"
              {...register('description')}
            />
            {errors.description && <p className="text-[11px] text-rose-500 font-semibold">{errors.description.message}</p>}
          </div>

          {/* Assign User - ADMIN ONLY */}
          {currentUser.role === 'ADMIN' ? (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Assign To Staff *</label>
              <select
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
                {...register('assignedTo')}
              >
                {staffUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              {errors.assignedTo && <p className="text-[11px] text-rose-500 font-semibold">{errors.assignedTo.message}</p>}
            </div>
          ) : (
            <input type="hidden" value={currentUser.id} {...register('assignedTo')} />
          )}

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
              {isSubmitting ? <Spinner className="w-3.5 h-3.5 border-t-white" /> : 'Assign Task'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
