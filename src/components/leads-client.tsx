'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadSchema } from '@/validations/schemas';
import { createLeadAction, updateLeadAction, deleteLeadAction } from '@/actions/crm.actions';
import { useToast } from './ui/toast';
import { Dialog } from './ui/dialog';
import { Spinner } from './ui/loader';
import { EmptyState } from './ui/empty-state';
import { z } from 'zod';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  Phone,
  Mail,
  User,
} from 'lucide-react';
import { Lead, AuthUser, User as DBUser } from '@/types';

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadsClientProps {
  initialLeads: Lead[];
  salesAgents: DBUser[];
  currentUser: AuthUser;
}

export function LeadsClient({ initialLeads, salesAgents, currentUser }: LeadsClientProps) {
  const { showToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);

  // Modal Dialogs state
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // React Hook Form for Add Lead
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: errorsAdd, isSubmitting: isSubmittingAdd },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema) as any,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      source: 'Facebook Ads',
      status: 'NEW',
      notes: '',
      assignedTo: currentUser.role === 'SALES' ? currentUser.id : undefined,
    },
  });

  // React Hook Form for Edit Lead
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setEditValue,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema) as any,
  });

  // Handle open edit modal
  const openEditModal = (lead: Lead) => {
    setSelectedLead(lead);
    resetEdit({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone,
      source: lead.source,
      status: lead.status as any,
      notes: lead.notes || '',
      assignedTo: lead.assignedTo || undefined,
      followUpDate: lead.followUpDate ? new Date(lead.followUpDate).toISOString().split('T')[0] : undefined,
    });
    setEditOpen(true);
  };

  // Add Lead submit
  const onAddSubmit = async (data: LeadFormValues) => {
    try {
      const res = await createLeadAction(data);
      if (res.success && res.data) {
        showToast('Lead created successfully', 'success');
        setLeads((prev) => [res.data as any, ...prev]);
        setAddOpen(false);
        resetAdd();
      } else {
        showToast(res.error || 'Failed to create lead', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Edit Lead submit
  const onEditSubmit = async (data: LeadFormValues) => {
    if (!selectedLead) return;
    try {
      const res = await updateLeadAction(selectedLead.id, data);
      if (res.success && res.data) {
        showToast('Lead updated successfully', 'success');
        setLeads((prev) => prev.map((l) => (l.id === selectedLead.id ? res.data as any : l)));
        setEditOpen(false);
      } else {
        showToast(res.error || 'Failed to update lead', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  // Delete Lead
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    setLoading(true);
    try {
      const res = await deleteLeadAction(id);
      if (res.success) {
        showToast('Lead deleted successfully', 'success');
        setLeads((prev) => prev.filter((l) => l.id !== id));
      } else {
        showToast(res.error || 'Failed to delete lead', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter Leads client-side for ultra-fast UX
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.phone || '').includes(search) ||
      (lead.email && lead.email.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">CRM Leads Management</h2>
          <p className="text-xs text-slate-500 mt-1">Capture, assign, and convert academy prospects.</p>
        </div>
        
        {/* Add Lead trigger */}
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-violet-500/10"
        >
          <Plus className="w-4 h-4" />
          Capture New Lead
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads by name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 rounded-xl focus:outline-none focus:border-violet-500 transition"
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['ALL', 'NEW', 'CONTACTED', 'INTERESTED', 'PAID', 'CLOSED'].map((status) => (
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

      {/* Leads Table/Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden animate-scale-in">
        {filteredLeads.length === 0 ? (
          <EmptyState
            icon={User}
            title="No leads found"
            description="Try modifying search keywords or create a new lead to start logging sales conversions."
            actionText="Create New Lead"
            onAction={() => setAddOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/50 select-none">
                  <th className="p-4 pl-6">Client Info</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Channel Source</th>
                  <th className="p-4">Workflow Status</th>
                  <th className="p-4">Assigned Agent</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLeads.map((lead, idx) => {
                  const delayClass = idx < 6 ? ["delay-50", "delay-100", "delay-150", "delay-200", "delay-250", "delay-300"][idx] : "";
                  return (
                    <tr
                      key={lead.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all duration-200 text-slate-800 dark:text-slate-200 animate-fade-in-up ${delayClass}`}
                    >
                      {/* Client Info */}
                      <td className="p-4 pl-6">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">{lead.name}</p>
                        {lead.notes && (
                          <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] truncate leading-normal" title={lead.notes}>
                            {lead.notes}
                          </p>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="p-4 text-xs font-medium space-y-1">
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {lead.phone}
                        </p>
                        {lead.email && (
                          <p className="flex items-center gap-1.5 text-slate-500">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            {lead.email}
                          </p>
                        )}
                      </td>

                      {/* Channel Source */}
                      <td className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {lead.source}
                      </td>

                      {/* Workflow Status */}
                      <td className="p-4 text-xs">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full select-none ${
                          lead.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : lead.status === 'INTERESTED'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : lead.status === 'CONTACTED'
                            ? 'bg-amber-500/10 text-amber-600'
                            : lead.status === 'CLOSED'
                            ? 'bg-slate-500/10 text-slate-500'
                            : 'bg-indigo-500/10 text-indigo-600'
                        }`}>
                          {lead.status}
                        </span>
                      </td>

                      {/* Assigned Agent */}
                      <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                        {lead.assignedToUser?.name || <span className="text-slate-400 text-[10px]">Unassigned</span>}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right pr-6 space-x-1.5">
                        <button
                          onClick={() => openEditModal(lead)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-150 active:scale-90 inline-flex items-center cursor-pointer"
                          title="Edit lead Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        
                        {currentUser.role === 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 transition-all duration-150 active:scale-90 inline-flex items-center cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- ADD LEAD DIALOG MODAL --- */}
      <Dialog isOpen={addOpen} onClose={() => setAddOpen(false)} title="Log New Prospect Lead" size="md">
        <form onSubmit={handleSubmitAdd(onAddSubmit)} className="space-y-4 pt-1">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Amr Khaled"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
              {...registerAdd('name')}
            />
            {errorsAdd.name && <p className="text-[11px] text-rose-500 font-semibold">{errorsAdd.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Phone Number *</label>
              <input
                type="text"
                placeholder="e.g. +201001234567"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
                {...registerAdd('phone')}
              />
              {errorsAdd.phone && <p className="text-[11px] text-rose-500 font-semibold">{errorsAdd.phone.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <input
                type="email"
                placeholder="e.g. client@gmail.com"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
                {...registerAdd('email')}
              />
              {errorsAdd.email && <p className="text-[11px] text-rose-500 font-semibold">{errorsAdd.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Channel Source */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Acquisition Channel *</label>
              <select
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
                {...registerAdd('source')}
              >
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Google Search">Google Search</option>
                <option value="Referral">Referral</option>
                <option value="Word of Mouth">Word of Mouth</option>
                <option value="Website Form">Website Form</option>
              </select>
              {errorsAdd.source && <p className="text-[11px] text-rose-500 font-semibold">{errorsAdd.source.message}</p>}
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">CRM Workflow Status *</label>
              <select
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
                {...registerAdd('status')}
              >
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="INTERESTED">INTERESTED</option>
                <option value="PAID">PAID (Triggers Student Profile)</option>
                <option value="CLOSED">CLOSED</option>
              </select>
              {errorsAdd.status && <p className="text-[11px] text-rose-500 font-semibold">{errorsAdd.status.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assigned to agent */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Assign to Sales Agent</label>
              <select
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
                {...registerAdd('assignedTo')}
              >
                <option value="">Unassigned</option>
                {salesAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              {errorsAdd.assignedTo && <p className="text-[11px] text-rose-500 font-semibold">{errorsAdd.assignedTo.message}</p>}
            </div>

            {/* Follow up date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Next Follow-Up Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
                {...registerAdd('followUpDate')}
              />
              {errorsAdd.followUpDate && <p className="text-[11px] text-rose-500 font-semibold">{errorsAdd.followUpDate.message}</p>}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Notes & Interactions</label>
            <textarea
              placeholder="Record details of conversations or initial client queries..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition resize-none"
              {...registerAdd('notes')}
            />
            {errorsAdd.notes && <p className="text-[11px] text-rose-500 font-semibold">{errorsAdd.notes.message}</p>}
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
              disabled={isSubmittingAdd}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl shadow transition disabled:opacity-50"
            >
              {isSubmittingAdd ? <Spinner className="w-3.5 h-3.5 border-t-white" /> : 'Log Lead'}
            </button>
          </div>
        </form>
      </Dialog>

      {/* --- EDIT LEAD DIALOG MODAL --- */}
      <Dialog isOpen={editOpen} onClose={() => setEditOpen(false)} title="Update Lead Information" size="md">
        <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4 pt-1">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Full Name *</label>
            <input
              type="text"
              placeholder="e.g. Amr Khaled"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
              {...registerEdit('name')}
            />
            {errorsEdit.name && <p className="text-[11px] text-rose-500 font-semibold">{errorsEdit.name.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Phone Number *</label>
              <input
                type="text"
                placeholder="e.g. +201001234567"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
                {...registerEdit('phone')}
              />
              {errorsEdit.phone && <p className="text-[11px] text-rose-500 font-semibold">{errorsEdit.phone.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Email Address</label>
              <input
                type="email"
                placeholder="e.g. client@gmail.com"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition"
                {...registerEdit('email')}
              />
              {errorsEdit.email && <p className="text-[11px] text-rose-500 font-semibold">{errorsEdit.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Channel Source */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Acquisition Channel *</label>
              <select
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
                {...registerEdit('source')}
              >
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Google Search">Google Search</option>
                <option value="Referral">Referral</option>
                <option value="Word of Mouth">Word of Mouth</option>
                <option value="Website Form">Website Form</option>
              </select>
              {errorsEdit.source && <p className="text-[11px] text-rose-500 font-semibold">{errorsEdit.source.message}</p>}
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">CRM Workflow Status *</label>
              <select
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
                {...registerEdit('status')}
              >
                <option value="NEW">NEW</option>
                <option value="CONTACTED">CONTACTED</option>
                <option value="INTERESTED">INTERESTED</option>
                <option value="PAID">PAID (Triggers Student Profile)</option>
                <option value="CLOSED">CLOSED</option>
              </select>
              {errorsEdit.status && <p className="text-[11px] text-rose-500 font-semibold">{errorsEdit.status.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assigned to agent */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Assign to Sales Agent</label>
              <select
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
                {...registerEdit('assignedTo')}
              >
                <option value="">Unassigned</option>
                {salesAgents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              {errorsEdit.assignedTo && <p className="text-[11px] text-rose-500 font-semibold">{errorsEdit.assignedTo.message}</p>}
            </div>

            {/* Follow up date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Next Follow-Up Date</label>
              <input
                type="date"
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition cursor-pointer"
                {...registerEdit('followUpDate')}
              />
              {errorsEdit.followUpDate && <p className="text-[11px] text-rose-500 font-semibold">{errorsEdit.followUpDate.message}</p>}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400">Notes & Interactions</label>
            <textarea
              placeholder="Record details of conversations..."
              rows={3}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm rounded-xl focus:outline-none focus:border-violet-500 transition resize-none"
              {...registerEdit('notes')}
            />
            {errorsEdit.notes && <p className="text-[11px] text-rose-500 font-semibold">{errorsEdit.notes.message}</p>}
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingEdit}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-xl shadow transition"
            >
              {isSubmittingEdit ? <Spinner className="w-3.5 h-3.5 border-t-white" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
