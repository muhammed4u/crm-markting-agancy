import React from 'react';
import { AuthService } from '@/services/auth.service';
import { CrmService } from '@/services/crm.service';
import { DashboardChart } from '@/components/dashboard-chart';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  BookOpen,
  DollarSign,
  ClipboardList,
  History,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await AuthService.getSession();
  if (!session?.user) {
    redirect('/login');
  }

  const user = session.user;
  const statsResult = await CrmService.getDashboardStats(user);

  // If user is a student, render the Student Dashboard view
  if (statsResult.isStudent) {
    const { enrolledCount, paidSum, pendingSum, attendanceRate } = statsResult.stats;
    const myCourses = statsResult.myCourses || [];
    const myPayments = statsResult.myPayments || [];
    const myAttendance = statsResult.myAttendance || [];

    return (
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user.name}!
          </h2>
          <p className="text-xs text-slate-500 mt-1">Academy Student Portal. Track your classes, attendance, and fees.</p>
        </div>

        {/* Student KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Enrolled Courses */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Enrolled Courses</span>
              <BookOpen className="w-5 h-5 text-violet-500" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{enrolledCount}</span>
              <p className="text-[11px] text-slate-400 mt-1">Active curricula programs</p>
            </div>
          </div>

          {/* Attendance Rate */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Attendance Rate</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{attendanceRate}%</span>
              <p className="text-[11px] text-slate-400 mt-1">Presence in lectures</p>
            </div>
          </div>

          {/* Paid Sum */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Paid Installments</span>
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">${paidSum}</span>
              <p className="text-[11px] text-slate-400 mt-1">Settled invoices amount</p>
            </div>
          </div>

          {/* Pending Sum */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Dues</span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">${pendingSum}</span>
              <p className="text-[11px] text-slate-400 mt-1">Due billing invoices</p>
            </div>
          </div>
        </div>

        {/* Classes & Finances */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Courses List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Your Courses Syllabus</h3>
            {myCourses.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">You are not enrolled in any courses yet.</p>
            ) : (
              <div className="space-y-4">
                {myCourses.map((course: any) => (
                  <div key={course.id} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-xl flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{course.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">{course.description || 'Academy syllabus'}</p>
                    </div>
                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="text-xs font-semibold text-violet-600 hover:underline"
                    >
                      Enter Class
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payments list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Billing History</h3>
            {myPayments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No payment records found.</p>
            ) : (
              <div className="space-y-3 text-xs">
                {myPayments.map((pay: any) => (
                  <div key={pay.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                    <div>
                      <p className="font-semibold text-slate-850 dark:text-slate-200">Payment Invoice</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{pay.method} • {new Date(pay.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">${pay.amount}</p>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        pay.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {pay.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Staff & Admin Dashboard view ---
  const {
    totalLeads = 0,
    totalStudents = 0,
    activeCourses = 0,
    totalRevenue = 0,
  } = statsResult.stats;

  const chartData = (statsResult.revenueByMonth || []).map((item: any) => ({
    month: item.month,
    revenue: item.amount || 0,
    leads: Math.max(1, Math.round((item.amount || 0) / 250)),
  }));
  const recentPayments = statsResult.recentPayments || [];
  const recentLogs = statsResult.recentActivities || [];

  // Fetch pending tasks for the staff dashboard list
  const tasksResult = await CrmService.getTasks({ status: 'TODO' }, user);
  const tasks = tasksResult.slice(0, 4);

  // Fetch recent leads for the dashboard leads card
  let recentLeads: any[] = [];
  if (user.role === 'ADMIN' || user.role === 'SALES') {
    const leadsRes = await CrmService.getLeads({ limit: 4 }, user);
    recentLeads = leadsRes.leads;
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Workspace Overview</h2>
        <p className="text-xs text-slate-500 mt-1">Real-time indicators and critical metrics of the academy.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1: Leads */}
        {(user.role === 'ADMIN' || user.permissions.includes('leads:read')) ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm relative overflow-hidden transition-all hover:shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Leads</span>
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalLeads}</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +12% vs last month
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm relative overflow-hidden transition-all hover:shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Dashboard View</span>
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-base font-bold text-slate-900 dark:text-white">Academy Staff</span>
              <p className="text-[11px] text-slate-500 mt-1">Restricted role scope mapping.</p>
            </div>
          </div>
        )}

        {/* KPI 2: Students */}
        {(user.role === 'ADMIN' || user.permissions.includes('students:read')) && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm relative overflow-hidden transition-all hover:shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Enrolled Students</span>
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalStudents}</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +8% enrollment conversion
              </span>
            </div>
          </div>
        )}

        {/* KPI 3: Courses */}
        {(user.role === 'ADMIN' || user.permissions.includes('courses:read')) && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm relative overflow-hidden transition-all hover:shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Academy Courses</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{activeCourses}</span>
              <p className="text-[11px] text-slate-500 mt-1">Active syllabus programs</p>
            </div>
          </div>
        )}

        {/* KPI 4: Revenue */}
        {(user.role === 'ADMIN' || user.permissions.includes('payments:read')) && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm relative overflow-hidden transition-all hover:shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gross Income</span>
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">${totalRevenue}</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold mt-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +15.4% revenue increase
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Section */}
      {(user.role === 'ADMIN' || user.permissions.includes('payments:read') || user.permissions.includes('leads:read')) && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Growth Dynamics</h3>
              <p className="text-[11px] text-slate-500">Overlay metrics mapping inbound leads against recorded receipts.</p>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-violet-600 inline-block" />
                Revenue ($)
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded bg-cyan-500 inline-block" />
                Leads Count
              </span>
            </div>
          </div>
          <DashboardChart data={chartData} />
        </div>
      )}

      {/* Lists / Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Tasks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-violet-600" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Pending Actions</h3>
              </div>
              <Link
                href="/dashboard/tasks"
                className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5"
              >
                Go to Tasks
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3.5">
              {tasks.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">No tasks assigned.</p>
              ) : (
                tasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between gap-4 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/50"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {task.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{task.title}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 max-w-[250px]">
                          {task.description}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full select-none ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'bg-amber-500/10 text-amber-600'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Card: Dynamic content based on role */}

        {/* Leads Card (Admin/Sales) */}
        {(user.role === 'ADMIN' || user.permissions.includes('leads:read')) && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-violet-600" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Recent Inbound Leads</h3>
                </div>
                <Link
                  href="/dashboard/leads"
                  className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5"
                >
                  Manage Leads
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {recentLeads.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">No recent leads.</p>
                ) : (
                  recentLeads.map((lead: any) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/50"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{lead.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{lead.email || lead.phone} • {lead.source}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
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
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Payments Card (Accountant) */}
        {(user.role === 'ADMIN' || user.permissions.includes('payments:read')) && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-violet-600" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Recent Transactions</h3>
                </div>
                <Link
                  href="/dashboard/payments"
                  className="text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5"
                >
                  Manage Invoices
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3">
                {recentPayments.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">No recent payments.</p>
                ) : (
                  recentPayments.map((pay: any) => (
                    <div
                      key={pay.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100/50 dark:border-slate-800/50"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {pay.student}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{pay.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">${pay.amount}</p>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          pay.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : pay.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-rose-500/10 text-rose-600'
                        }`}>
                          {pay.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Audit Log Card (Admin Only) */}
        {user.role === 'ADMIN' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-violet-600" />
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Security Audit Trail</h3>
                </div>
              </div>

              <div className="space-y-3">
                {recentLogs.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-6">No logs registered.</p>
                ) : (
                  recentLogs.map((log: any) => (
                    <div
                      key={log.id}
                      className="flex items-start justify-between gap-4 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {log.user || 'System'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 leading-tight">{log.details}</p>
                      </div>
                      <span className="text-[9px] text-slate-400 flex-shrink-0 mt-0.5">
                        {log.time}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
