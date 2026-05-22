'use client';

import React, { useState } from 'react';
import { useToast } from './ui/toast';
import { Spinner } from './ui/loader';
import { EmptyState } from './ui/empty-state';
import {
  Search,
  Shield,
  User,
  CheckCircle,
  Edit2,
  Trash2,
  Users,
  Settings,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserMinus,
  Sparkles,
} from 'lucide-react';
import { AuthUser } from '@/types';
import { Dialog } from './ui/dialog';

// Custom interface for user objects handled in this client view
interface RosterUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'ADMIN' | 'SALES' | 'INSTRUCTOR' | 'ACCOUNTANT' | 'STUDENT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  permissions: string[];
  createdAt: string;
}

interface UsersClientProps {
  initialUsers: RosterUser[];
  currentUser: AuthUser;
}

const ALL_PERMISSIONS = [
  { value: 'leads:read', label: 'Read Inbound Leads', group: 'CRM Leads' },
  { value: 'leads:write', label: 'Write/Create Leads', group: 'CRM Leads' },
  { value: 'students:read', label: 'Read Students List', group: 'Students' },
  { value: 'students:write', label: 'Write/Edit Students', group: 'Students' },
  { value: 'courses:read', label: 'Read Syllabus/Courses', group: 'Courses' },
  { value: 'courses:write', label: 'Write/Edit Courses', group: 'Courses' },
  { value: 'payments:read', label: 'Read Payments/Revenue', group: 'Finance' },
  { value: 'payments:write', label: 'Write/Edit Invoices', group: 'Finance' },
  { value: 'attendance:read', label: 'Read Class Attendance', group: 'Academy' },
  { value: 'attendance:write', label: 'Write/Edit Attendance', group: 'Academy' },
  { value: 'tasks:read', label: 'Read Assignments/Tasks', group: 'Workspace' },
  { value: 'tasks:write', label: 'Write/Edit Tasks', group: 'Workspace' },
  { value: 'reports:read', label: 'Read Analytics Reports', group: 'Workspace' },
  { value: 'reports:write', label: 'Write/Edit Reports', group: 'Workspace' },
  { value: 'users:read', label: 'Read User Directories', group: 'Management' },
  { value: 'users:write', label: 'Modify System Users', group: 'Management' },
  { value: 'settings:read', label: 'Read Configuration', group: 'Management' },
  { value: 'settings:write', label: 'Write System Configs', group: 'Management' },
];

const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  ADMIN: ALL_PERMISSIONS.map((p) => p.value),
  SALES: ['leads:read', 'leads:write', 'students:read', 'courses:read', 'tasks:read', 'tasks:write'],
  INSTRUCTOR: ['students:read', 'courses:read', 'courses:write', 'attendance:read', 'attendance:write', 'tasks:read', 'tasks:write'],
  ACCOUNTANT: ['payments:read', 'payments:write', 'reports:read', 'tasks:read', 'tasks:write'],
  STUDENT: ['courses:read', 'payments:read', 'attendance:read'],
};

export function UsersClient({ initialUsers, currentUser }: UsersClientProps) {
  const { showToast } = useToast();
  const [users, setUsers] = useState<RosterUser[]>(initialUsers);
  const [activeTab, setActiveTab] = useState<'requests' | 'roster'>('requests');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<RosterUser | null>(null);
  
  // Dialog State Form
  const [newRole, setNewRole] = useState<RosterUser['role']>('STUDENT');
  const [newStatus, setNewStatus] = useState<RosterUser['status']>('PENDING');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Group users by pending status
  const pendingRequests = users.filter((u) => u.status === 'PENDING');
  const activeRoster = users.filter((u) => u.status === 'APPROVED' || u.status === 'REJECTED');

  // Filter roster based on search and roles
  const displayedUsers = (activeTab === 'requests' ? pendingRequests : activeRoster).filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openEditModal = (u: RosterUser) => {
    setSelectedUser(u);
    setNewRole(u.role);
    setNewStatus(u.status);
    setSelectedPermissions(u.permissions || []);
    setEditOpen(true);
  };

  const loadRolePresets = (roleName: string) => {
    const presets = DEFAULT_ROLE_PERMISSIONS[roleName] || [];
    setSelectedPermissions(presets);
  };

  const handleTogglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleApproveOrUpdate = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${selectedUser.id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          role: newRole,
          permissions: selectedPermissions,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('User credentials and scopes updated successfully.', 'success', 'Update Complete');
        
        // Update user state
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? {
                  ...u,
                  role: newRole,
                  status: newStatus,
                  permissions: selectedPermissions,
                }
              : u
          )
        );
        setEditOpen(false);
      } else {
        showToast(data.error || 'Failed to update user profile.', 'error', 'Operation Failed');
      }
    } catch (err: any) {
      showToast(err.message || 'An error occurred.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 group/title">
            <Shield className="w-5.5 h-5.5 text-violet-500 animate-float group-hover/title:rotate-12 transition-transform duration-300" />
            Security & Access Control
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Approve account requests, toggle administrative roles, and map granular permissions.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 dark:bg-slate-955 p-1 rounded-xl self-start sm:self-auto border border-slate-200/50 dark:border-slate-800/80">
          <button
            onClick={() => {
              setActiveTab('requests');
              setRoleFilter('ALL');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 active:scale-95 duration-200 transition-all ${
              activeTab === 'requests'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Access Requests
            {pendingRequests.length > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-white animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setActiveTab('roster');
              setRoleFilter('ALL');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold active:scale-95 duration-200 transition-all ${
              activeTab === 'roster'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Academy Roster
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'requests' ? 'Search requests...' : 'Search roster...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-650 rounded-xl focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        {/* System Role Quick Filter */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['ALL', 'ADMIN', 'SALES', 'INSTRUCTOR', 'ACCOUNTANT', 'STUDENT'].map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-semibold transition ${
                roleFilter === role
                  ? 'bg-slate-950 dark:bg-slate-100 text-white dark:text-slate-950 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        {displayedUsers.length === 0 ? (
          <EmptyState
            icon={activeTab === 'requests' ? ShieldAlert : Users}
            title={activeTab === 'requests' ? 'No Access Requests Pending' : 'No Roster Members Found'}
            description={
              activeTab === 'requests'
                ? 'All pending account approvals will appear here. Looking for already active students or staff? Check the Academy Roster.'
                : 'No active users found matching your current search or role filters.'
            }
            actionText={activeTab === 'requests' ? 'View Academy Roster' : undefined}
            onAction={activeTab === 'requests' ? () => setActiveTab('roster') : undefined}
          />
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-955/20 select-none">
                    <th className="p-4 pl-6">Profile Contact</th>
                    <th className="p-4">Contact Phone</th>
                    <th className="p-4">Assigned Role</th>
                    {activeTab === 'roster' && <th className="p-4">Approval Status</th>}
                    <th className="p-4">Permissions Active</th>
                    <th className="p-4">Registration Date</th>
                    {currentUser.role === 'ADMIN' && <th className="p-4 pr-6 text-right">Settings</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {displayedUsers.map((u, idx) => {
                    const delayClass = idx === 0 ? '' : idx === 1 ? 'delay-50' : idx === 2 ? 'delay-100' : idx === 3 ? 'delay-150' : 'delay-200';
                    return (
                      <tr
                        key={u.id}
                        className={`hover:bg-slate-50/30 dark:hover:bg-slate-850/25 transition-all text-slate-850 dark:text-slate-200 animate-fade-in-up ${delayClass}`}
                      >
                        {/* User profile */}
                        <td className="p-4 pl-6">
                          <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{u.email}</p>
                        </td>

                        {/* Contact Phone */}
                        <td className="p-4 text-slate-500 font-medium">{u.phone || 'N/A'}</td>

                        {/* Role */}
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full select-none ${
                            u.role === 'ADMIN'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : u.role === 'INSTRUCTOR'
                              ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                              : u.role === 'ACCOUNTANT'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : u.role === 'SALES'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-slate-500/10 text-slate-500'
                          }`}>
                            {u.role}
                          </span>
                        </td>

                        {/* Roster Status */}
                        {activeTab === 'roster' && (
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-0.5 rounded-full select-none ${
                              u.status === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-455'
                            }`}>
                              {u.status === 'APPROVED' ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  Approved
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  Rejected
                                </>
                              )}
                            </span>
                          </td>
                        )}

                        {/* Permissions summary */}
                        <td className="p-4">
                          {u.role === 'ADMIN' ? (
                            <span className="text-[10px] text-violet-500 dark:text-violet-405 font-bold select-none">
                              All Permissions (Bypass)
                            </span>
                          ) : (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]" title={u.permissions?.join(', ')}>
                              {u.permissions && u.permissions.length > 0
                                ? `${u.permissions.length} granular keys assigned`
                                : 'No permissions assigned'}
                            </p>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="p-4 text-slate-500 font-medium">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        {/* Actions */}
                        {currentUser.role === 'ADMIN' && (
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => openEditModal(u)}
                              className="p-1.5 rounded-lg hover:bg-slate-105 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition inline-flex items-center gap-1 font-semibold text-[10px] border border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 active:scale-95 duration-150"
                              title={activeTab === 'requests' ? 'Review & Approve Request' : 'Configure Access Scope'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              {activeTab === 'requests' ? 'Review' : 'Configure'}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-850">
              {displayedUsers.map((u, idx) => {
                const delayClass = idx === 0 ? '' : idx === 1 ? 'delay-50' : idx === 2 ? 'delay-100' : idx === 3 ? 'delay-150' : 'delay-200';
                return (
                  <div
                    key={u.id}
                    className={`p-4 space-y-3 hover:bg-slate-50/20 dark:hover:bg-slate-950/20 transition-all animate-fade-in-up ${delayClass}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white text-xs">{u.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 break-all">{u.email}</p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full select-none ${
                        u.role === 'ADMIN'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          : u.role === 'INSTRUCTOR'
                          ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                          : u.role === 'ACCOUNTANT'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : u.role === 'SALES'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-slate-500/10 text-slate-500'
                      }`}>
                        {u.role}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-1">
                      <div>
                        <span className="block text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Phone</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{u.phone || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider">Registered</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-850">
                      <div className="text-[10px]">
                        {activeTab === 'roster' ? (
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full select-none ${
                            u.status === 'APPROVED'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-455'
                          }`}>
                            {u.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                          </span>
                        ) : (
                          <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Pending Review
                          </span>
                        )}
                      </div>

                      {currentUser.role === 'ADMIN' && (
                        <button
                          onClick={() => openEditModal(u)}
                          className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition flex items-center gap-1 font-bold text-[10px] border border-slate-200/50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 active:scale-95 duration-150"
                        >
                          <Edit2 className="w-3 h-3" />
                          {activeTab === 'requests' ? 'Review' : 'Configure'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* --- EDIT / APPROVE SECURITY DIALOG --- */}
      <Dialog isOpen={editOpen} onClose={() => setEditOpen(false)} title="Configure Enterprise Access Scope" size="lg">
        {selectedUser && (
          <div className="space-y-6 pt-1 text-xs animate-scale-in">
            {/* User Meta Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Account Identity</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedUser.name}</h4>
                <p className="text-xs text-slate-500 font-medium">{selectedUser.email}</p>
              </div>

              <div className="text-right space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider block">Default Mapping</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-650/10 text-violet-600 dark:text-violet-400">
                  Role: {selectedUser.role}
                </span>
              </div>
            </div>

            {/* Config Split layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Role & Status */}
              <div className="space-y-4">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  1. Identity & State
                </h5>

                {/* Status Options */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-450">Approval Status *</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
                  >
                    <option value="PENDING">PENDING (Awaiting Review)</option>
                    <option value="APPROVED">APPROVED (Active Access)</option>
                    <option value="REJECTED">REJECTED (Access Denied)</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    Pending accounts are strictly routed to the approval waitlist. Rejected profiles are completely blocked.
                  </p>
                </div>

                {/* Role Options */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-450">System Role Scope *</label>
                  <select
                    value={newRole}
                    onChange={(e) => {
                      const roleVal = e.target.value as any;
                      setNewRole(roleVal);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
                  >
                    <option value="ADMIN">ADMIN (Full Platform Bypass)</option>
                    <option value="SALES">SALES (CRM & Lead Inbounds)</option>
                    <option value="INSTRUCTOR">INSTRUCTOR (Academy Syllabus & Attendance)</option>
                    <option value="ACCOUNTANT">ACCOUNTANT (Invoices & General Ledger)</option>
                    <option value="STUDENT">STUDENT (My Classes & Payments)</option>
                  </select>
                </div>

                {/* Preset Actions */}
                <div className="p-3 bg-violet-50/50 dark:bg-violet-950/10 border border-violet-100/50 dark:border-violet-850/50 rounded-xl space-y-2">
                  <span className="font-bold text-violet-800 dark:text-violet-400 block text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    Permission Preset Loader
                  </span>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Instantly replace current checkboxes with standard default settings for the selected role.
                  </p>
                  <button
                    type="button"
                    onClick={() => loadRolePresets(newRole)}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-[10px] font-bold shadow-sm transition active:scale-95"
                  >
                    Load Presets for {newRole}
                  </button>
                </div>
              </div>

              {/* Right Column: Permission Matrix */}
              <div className="space-y-4">
                <h5 className="font-bold text-slate-900 dark:text-white text-xs border-b border-slate-100 dark:border-slate-800/80 pb-2">
                  2. Granular Security Keys
                </h5>

                {newRole === 'ADMIN' ? (
                  <div className="p-6 text-center bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <ShieldCheck className="w-8 h-8 text-violet-500 mx-auto mb-2" />
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">Full Administrative Access</p>
                    <p className="text-[10px] text-slate-450 leading-relaxed mt-1">
                      ADMIN accounts bypass all granular key validations on both Client and Server-side layers. No restrictions apply.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-450 font-bold border-b border-slate-100 dark:border-slate-800/50 pb-1">
                      <span>Security Scope Key</span>
                      <span>Grant</span>
                    </div>

                    {/* Group by category */}
                    {Array.from(new Set(ALL_PERMISSIONS.map((p) => p.group))).map((groupName) => (
                      <div key={groupName} className="space-y-1.5">
                        <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-widest block mt-2">
                          {groupName}
                        </span>
                        
                        {ALL_PERMISSIONS.filter((p) => p.group === groupName).map((p) => {
                          const isChecked = selectedPermissions.includes(p.value);
                          return (
                            <label
                              key={p.value}
                              className={`flex items-center justify-between p-2 rounded-lg border text-[11px] font-medium transition cursor-pointer select-none ${
                                isChecked
                                  ? 'bg-violet-600/5 border-violet-500/30 text-slate-900 dark:text-white'
                                  : 'bg-slate-50/40 dark:bg-slate-950/20 border-slate-200/50 dark:border-slate-800/80 text-slate-500'
                              }`}
                            >
                              <div className="flex flex-col gap-0.5 text-left">
                                <span>{p.label}</span>
                                <span className="text-[9px] text-slate-400 dark:text-slate-600 font-mono">
                                  {p.value}
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTogglePermission(p.value)}
                                className="w-4 h-4 rounded text-violet-600 border-slate-350 focus:ring-violet-500 accent-violet-600 cursor-pointer"
                              />
                            </label>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dialog Footer Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveOrUpdate}
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-500/10 transition active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Spinner className="w-3.5 h-3.5 border-t-white animate-spin" />
                    Saving changes...
                  </>
                ) : (
                  <>
                    Save Permissions & Role
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
