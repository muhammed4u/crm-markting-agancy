import React from 'react';
import { AuthService } from '@/services/auth.service';
import { CrmService } from '@/services/crm.service';
import { UserRepository } from '@/repositories/user.repository';
import { LeadsClient } from '@/components/leads-client';
import { redirect } from 'next/navigation';

export default async function LeadsPage() {
  const session = await AuthService.getSession();
  if (!session?.user) {
    redirect('/login');
  }

  // Fetch initial leads for the user scope
  const leadsResult = await CrmService.getLeads({}, session.user);
  
  // Fetch active sales agents for assignment mapping
  const salesAgents = await UserRepository.findAll({ role: 'SALES' });

  // Map types to ensure strict typescript safety
  const safeLeads = leadsResult.leads.map((l: any) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
    followUpDate: l.followUpDate ? l.followUpDate.toISOString() : null,
    assignedToUser: l.assignedToUser ? {
      id: l.assignedToUser.id,
      name: l.assignedToUser.name,
      email: l.assignedToUser.email,
    } : null,
  }));

  const safeSalesAgents = salesAgents.map((agent: any) => ({
    id: agent.id,
    name: agent.name,
    email: agent.email,
    role: agent.role,
    phone: agent.phone,
    createdAt: agent.createdAt.toISOString(),
  }));

  return (
    <LeadsClient
      initialLeads={safeLeads as any}
      salesAgents={safeSalesAgents as any}
      currentUser={session.user}
    />
  );
}
