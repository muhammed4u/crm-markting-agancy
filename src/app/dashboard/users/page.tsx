import React from 'react';
import { AuthService } from '@/services/auth.service';
import { prisma } from '@/lib/prisma';
import { UsersClient } from '@/components/users-client';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
  const session = await AuthService.getSession();
  if (!session?.user) {
    redirect('/login');
  }

  // Retrieve user list sorted by newest registration with permissions included
  const dbUsers = await prisma.user.findMany({
    include: {
      permissions: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const safeUsers = dbUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    permissions: u.permissions.map((p) => p.permission),
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <UsersClient
      initialUsers={safeUsers as any}
      currentUser={session.user}
    />
  );
}
