import React from 'react';
import { AuthService } from '@/services/auth.service';
import { CrmService } from '@/services/crm.service';
import { prisma } from '@/lib/prisma';
import { TasksClient } from '@/components/tasks-client';
import { redirect } from 'next/navigation';

export default async function TasksPage() {
  const session = await AuthService.getSession();
  if (!session?.user) {
    redirect('/login');
  }

  // 1. Fetch tasks
  const tasks = await CrmService.getTasks({}, session.user);

  // 2. Fetch list of staff members for task assignments
  const dbStaff = await prisma.user.findMany({
    where: {
      role: {
        in: ['ADMIN', 'SALES', 'INSTRUCTOR', 'ACCOUNTANT'],
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  // Map to safe serializable types
  const safeTasks = tasks.map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    assignedTo: t.assignedTo,
    createdAt: t.createdAt.toISOString(),
    assignedToUser: t.assignedToUser ? {
      name: t.assignedToUser.name,
    } : null,
  }));

  return (
    <TasksClient
      initialTasks={safeTasks as any}
      staffUsers={dbStaff}
      currentUser={session.user}
    />
  );
}
