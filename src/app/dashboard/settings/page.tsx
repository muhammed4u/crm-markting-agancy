import React from 'react';
import { AuthService } from '@/services/auth.service';
import { SettingsClient } from '@/components/settings-client';
import { UserRepository } from '@/repositories/user.repository';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await AuthService.getSession();
  if (!session?.user) {
    redirect('/login');
  }

  const dbUser = await UserRepository.findById(session.user.id);
  if (!dbUser) {
    redirect('/login');
  }

  const safeUser = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role as any,
    phone: dbUser.phone || '',
    status: dbUser.status as any,
    permissions: dbUser.permissions.map((p) => p.permission),
  };

  return <SettingsClient currentUser={safeUser} />;
}
