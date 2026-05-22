import React from 'react';
import { AuthService } from '@/services/auth.service';
import { CrmService } from '@/services/crm.service';
import { StudentRepository } from '@/repositories/student.repository';
import { PaymentsClient } from '@/components/payments-client';
import { redirect } from 'next/navigation';

export default async function PaymentsPage() {
  const session = await AuthService.getSession();
  if (!session?.user) {
    redirect('/login');
  }

  // 1. Fetch payments (checks session role inside CrmService)
  const payments = await CrmService.getPayments({}, session.user);

  // 2. Fetch list of students for billing select input
  let studentsOptionList: any[] = [];
  if (session.user.role === 'ADMIN' || session.user.role === 'ACCOUNTANT') {
    const dbStudents = await StudentRepository.findAll({});
    studentsOptionList = dbStudents.map((s: any) => ({
      id: s.id,
      name: s.user.name,
      phone: s.user.phone,
    }));
  }

  // Map to safe serializable types
  const safePayments = payments.payments.map((p: any) => ({
    id: p.id,
    amount: p.amount,
    method: p.method,
    status: p.status,
    paidAt: p.paidAt ? p.paidAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    student: {
      user: {
        name: p.student?.user?.name || 'Self Registered',
      },
    },
  }));

  return (
    <PaymentsClient
      initialPayments={safePayments as any}
      students={studentsOptionList}
      currentUser={session.user}
    />
  );
}
