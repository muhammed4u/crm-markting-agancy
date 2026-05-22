'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { paymentSchema } from '@/validations/schemas';
import { createPaymentAction } from '@/actions/crm.actions';
import { useToast } from './ui/toast';
import { Dialog } from './ui/dialog';
import { Spinner } from './ui/loader';
import { EmptyState } from './ui/empty-state';
import { z } from 'zod';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
} from 'lucide-react';
import { Payment, AuthUser, Student } from '@/types';

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface StudentOption {
  id: string;
  name: string;
  phone: string;
}

interface PaymentsClientProps {
  initialPayments: Payment[];
  students: StudentOption[];
  currentUser: AuthUser;
}

export function PaymentsClient({ initialPayments, students, currentUser }: PaymentsClientProps) {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [addOpen, setAddOpen] = useState(false);

  // Form setup for logging payment
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      studentId: '',
      amount: 1000,
      method: 'Instapay',
      status: 'PAID',
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    try {
      const res = await createPaymentAction(data);
      if (res.success && res.data) {
        showToast('Payment transaction recorded', 'success');
        
        // Add logged payment locally (remapping user fields)
        const selectedStudent = students.find((s) => s.id === data.studentId)!;
        const newPaymentRecord = {
          ...res.data,
          student: {
            user: {
              name: selectedStudent.name,
            },
          },
        };

        setPayments((prev: any) => [newPaymentRecord, ...prev]);
        setAddOpen(false);
        reset();
      } else {
        showToast(res.error || 'Failed to record payment', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Client-side filtering
  const filteredPayments = payments.filter((pay) => {
    const matchesSearch =
      (pay.student?.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      pay.method.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || pay.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Academy Payments Ledgers</h2>
          <p className="text-xs text-slate-500 mt-1">Track tuition payments, outstanding balances, and log financial logs.</p>
        </div>

        {/* Trigger log payment (Admin & Accountant only) */}
        {(currentUser.role === 'ADMIN' || currentUser.role === 'ACCOUNTANT') && (
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-violet-500/10"
          >
            <Plus className="w-4 h-4" />
            Log Transaction Receipt
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions by student, channel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 rounded-xl focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        {/* Status filters */}
        <div className="flex gap-2 w-full md:w-auto">
          {['ALL', 'PAID', 'PENDING', 'OVERDUE'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === status
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow'
                  : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        {filteredPayments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No transactions listed"
            description="There are no payment ledgers matching the filters."
            actionText={currentUser.role !== 'STUDENT' ? 'Log First Payment' : undefined}
            onAction={currentUser.role !== 'STUDENT' ? () => setAddOpen(true) : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50 select-none">
                  <th className="p-4 pl-6">Receipt ID / Student</th>
                  <th className="p-4">Transaction Date</th>
                  <th className="p-4">Gateway Method</th>
                  <th className="p-4">Paid Amount</th>
                  <th className="p-4 pr-6 text-right">Settlement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredPayments.map((pay) => (
                  <tr
                    key={pay.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors text-slate-800 dark:text-slate-200"
                  >
                    {/* Invoice ID / Student Name */}
                    <td className="p-4 pl-6">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {pay.student?.user?.name || 'Self Registered'}
                      </p>
                      <p className="text-[9px] text-slate-400 mt-0.5 uppercase">INV-{pay.id.substring(0, 8)}</p>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-slate-500 font-medium">
                      {pay.paidAt ? new Date(pay.paidAt).toLocaleDateString() : new Date(pay.createdAt).toLocaleDateString()}
                    </td>

                    {/* Method */}
                    <td className="p-4 font-semibold text-slate-600 dark:text-slate-400">
                      {pay.method}
                    </td>

                    {/* Amount */}
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      ${pay.amount}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4 pr-6 text-right">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full select-none ${
                        pay.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : pay.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {pay.status === 'PAID' && <CheckCircle className="w-3 h-3" />}
                        {pay.status === 'PENDING' && <Clock className="w-3 h-3" />}
                        {pay.status === 'OVERDUE' && <AlertCircle className="w-3 h-3" />}
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- LOG PAYMENT DIALOG MODAL --- */}
      <Dialog isOpen={addOpen} onClose={() => setAddOpen(false)} title="Record Student Payment Receipt" size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {/* Select Student */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Target Student Profile *</label>
            <select
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
              {...register('studentId')}
            >
              <option value="">-- Search and Select Student --</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.phone})
                </option>
              ))}
            </select>
            {errors.studentId && <p className="text-[11px] text-rose-500 font-semibold">{errors.studentId.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Payment Amount ($) *</label>
              <input
                type="number"
                placeholder="1250"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && <p className="text-[11px] text-rose-500 font-semibold">{errors.amount.message}</p>}
            </div>

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Payment Channel *</label>
              <select
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
                {...register('method')}
              >
                <option value="Vodafone Cash">Vodafone Cash</option>
                <option value="Instapay">Instapay</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
              {errors.method && <p className="text-[11px] text-rose-500 font-semibold">{errors.method.message}</p>}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Settlement Status *</label>
            <select
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
              {...register('status')}
            >
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="OVERDUE">OVERDUE</option>
            </select>
            {errors.status && <p className="text-[11px] text-rose-500 font-semibold">{errors.status.message}</p>}
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
              {isSubmitting ? <Spinner className="w-3.5 h-3.5 border-t-white" /> : 'Log Payment'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
