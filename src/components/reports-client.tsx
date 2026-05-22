'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Download, TrendingUp, DollarSign, Award, Users } from 'lucide-react';

interface ReportsProps {
  stats: {
    totalLeads: number;
    totalStudents: number;
    totalRevenue: number;
    leadsBySource: { name: string; value: number }[];
    studentsByLevel: { name: string; value: number }[];
    recentPayments: {
      id: string;
      studentName: string;
      amount: number;
      method: string;
      date: string;
    }[];
  };
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c'];

export function ReportsClient({ stats }: ReportsProps) {
  // Handle PDF/Print Export
  const handlePrint = () => {
    window.print();
  };

  // Handle CSV/Excel Export
  const handleCSVExport = () => {
    // Construct CSV content
    let csvContent = "\ufeff"; // BOM for Excel UTF-8 support
    
    // Summary metrics section
    csvContent += "ACADEMY CRM SUMMARY REPORT\n";
    csvContent += `Generated On,${new Date().toLocaleDateString()}\n\n`;
    
    csvContent += "Metric,Value\n";
    csvContent += `Accumulated Earnings,$${stats.totalRevenue}\n`;
    csvContent += `Captured Leads,${stats.totalLeads}\n`;
    csvContent += `Enrolled Students,${stats.totalStudents}\n\n`;
    
    // Lead sources section
    csvContent += "LEAD SOURCES BREAKDOWN\n";
    csvContent += "Source,Count\n";
    stats.leadsBySource.forEach(item => {
      csvContent += `"${item.name.replace(/"/g, '""')}",${item.value}\n`;
    });
    csvContent += "\n";
    
    // Student levels section
    csvContent += "STUDENT LEVELS BREAKDOWN\n";
    csvContent += "Level,Count\n";
    stats.studentsByLevel.forEach(item => {
      csvContent += `"${item.name.replace(/"/g, '""')}",${item.value}\n`;
    });
    csvContent += "\n";
    
    // Recent payments billing ledger
    csvContent += "RECENT SETTLED BILLING LEDGER\n";
    csvContent += "Student Name,Payment Date,Payment Method,Amount\n";
    stats.recentPayments.forEach(item => {
      csvContent += `"${item.studentName.replace(/"/g, '""')}","${item.date}","${item.method}",$${item.amount}\n`;
    });
    
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `academy-crm-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 print:p-8 print:bg-white print:text-black">
      {/* Title */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Academy Analytics & Reports</h2>
          <p className="text-xs text-slate-500 mt-1">Audit operational efficiency, lead conversion sources, and billing performance.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCSVExport}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition border border-slate-200 dark:border-slate-850 shadow-sm"
          >
            <FileText className="w-4 h-4 text-violet-500" />
            Export Excel / CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white text-xs font-semibold rounded-xl transition shadow"
          >
            <Download className="w-4 h-4" />
            Export PDF / Print
          </button>
        </div>
      </div>

      {/* Print-only Header */}
      <div className="hidden print:block border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold">Marketing Academy CRM Report</h1>
        <p className="text-sm text-slate-500">Generated on {new Date().toLocaleDateString()} • Confidential Executive Summary</p>
      </div>

      {/* Summary KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Accumulated Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">${stats.totalRevenue}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Settled invoice balance receipts</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Captured Leads</span>
            <TrendingUp className="w-4 h-4 text-violet-500" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalLeads}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Prospects logged in workspace</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Enrolled Students</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2.5">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalStudents}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Active profiles enrolled in courses</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4">
        {/* Left: Lead Sources bar chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Lead Source Breakdowns
          </h3>
          <div className="h-64">
            {stats.leadsBySource.length === 0 ? (
              <p className="text-center text-xs text-slate-400 pt-20">No source data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.leadsBySource}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Students Level pie chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Syllabus Level Distribution
          </h3>
          <div className="h-64 flex items-center justify-center">
            {stats.studentsByLevel.length === 0 ? (
              <p className="text-center text-xs text-slate-400">No student level data available.</p>
            ) : (
              <div className="relative w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.studentsByLevel}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {stats.studentsByLevel.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Custom Legends */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-4 text-[10px] font-semibold text-slate-500">
                  {stats.studentsByLevel.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span>{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent payment ledger summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
          Recent Settled Billing Audits
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-bold uppercase tracking-wider pb-2">
                <th className="py-2">Student</th>
                <th className="py-2">Date</th>
                <th className="py-2">Channel</th>
                <th className="py-2 text-right">Settled Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
              {stats.recentPayments.map((p) => (
                <tr key={p.id} className="text-slate-700 dark:text-slate-350">
                  <td className="py-2.5 font-semibold text-slate-900 dark:text-white">{p.studentName}</td>
                  <td className="py-2.5">{p.date}</td>
                  <td className="py-2.5">{p.method}</td>
                  <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">${p.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
