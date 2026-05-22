import React from 'react';
import { AuthService } from '@/services/auth.service';
import { prisma } from '@/lib/prisma';
import { ReportsClient } from '@/components/reports-client';
import { redirect } from 'next/navigation';

export default async function ReportsPage() {
  const session = await AuthService.getSession();
  if (!session?.user) {
    redirect('/login');
  }

  // 1. Gather raw counts
  const totalLeads = await prisma.lead.count();
  const totalStudents = await prisma.student.count();

  // 2. Sum settled payments
  const revenueAgg = await prisma.payment.aggregate({
    where: { status: 'PAID' },
    _sum: { amount: true },
  });
  const totalRevenue = revenueAgg._sum.amount || 0;

  // 3. Leads by Source
  const leadsBySourceGroup = await prisma.lead.groupBy({
    by: ['source'],
    _count: { id: true },
  });
  const leadsBySource = leadsBySourceGroup.map((g) => ({
    name: g.source || 'Unknown',
    value: g._count.id,
  }));

  // 4. Students by Level
  const studentsByLevelGroup = await prisma.student.groupBy({
    by: ['level'],
    _count: { id: true },
  });
  const studentsByLevel = studentsByLevelGroup.map((g) => ({
    name: g.level || 'Beginner',
    value: g._count.id,
  }));

  // 5. Recent Payments settled
  const recentPayments = await prisma.payment.findMany({
    where: { status: 'PAID' },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      student: {
        include: { user: true },
      },
    },
  });

  const stats = {
    totalLeads,
    totalStudents,
    totalRevenue,
    leadsBySource,
    studentsByLevel,
    recentPayments: recentPayments.map((p) => ({
      id: p.id,
      studentName: p.student?.user?.name || 'Academy Student',
      amount: p.amount,
      method: p.method,
      date: p.createdAt.toLocaleDateString(),
    })),
  };

  return <ReportsClient stats={stats} />;
}
