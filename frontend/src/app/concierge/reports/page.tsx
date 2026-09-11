'use client';

import React from 'react';
import { ConciergeSidebar } from '@/components/concierge/sidebar';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Download, FileText, ChevronDown, CheckCircle2, Clock } from 'lucide-react';

const REPORT_TYPES = [
  { id: 'conversation-summary', label: 'Conversation Summary', desc: 'Overview of all inbound queries and resolution states.' },
  { id: 'sla-performance', label: 'SLA Performance', desc: 'Detailed breakdown of response times and SLA breaches.' },
  { id: 'emergency-cases', label: 'Emergency Cases', desc: 'Log of all flagged emergencies, their duration, and outcome.' },
  { id: 'booking-assistance', label: 'Booking Assistance', desc: 'Metrics on concierge interventions in the booking process.' },
  { id: 'payment-assistance', label: 'Payment Assistance', desc: 'Log of payment links sent and payment failures handled.' },
  { id: 'concierge-activity', label: 'Concierge Activity', desc: 'Individual workload and resolution metrics per staff member.' },
];

export default function ConciergeReportsPage() {
  return (
    <div className="grid grid-rows-1 h-screen overflow-hidden bg-background text-text grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr]">
      <ConciergeSidebar />
      <main className="min-h-0 flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#FAFCFC]">
        {/* Page Header */}
        <div className="px-8 py-6 border-b border-border bg-surface sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">Reports</h1>
            <p className="text-sm text-text-muted mt-1">Generate and export concierge operational reports.</p>
          </div>
        </div>

        <div className="p-8 max-w-[1400px] w-full mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Generate Report Form */}
            <div className="bg-surface border border-border rounded-xl shadow-sm p-6 lg:col-span-1 h-fit">
              <h2 className="text-base font-bold text-text mb-6">Generate Report</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Report Type</label>
                  <Button variant="outline" className="w-full justify-between font-semibold h-11 bg-background">
                    Select Type... <ChevronDown className="w-4 h-4 text-text-muted" />
                  </Button>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Date Range</label>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="flex-1 justify-between font-semibold h-11 bg-background text-text-muted text-sm px-3">
                      Start Date
                    </Button>
                    <span className="text-text-muted">-</span>
                    <Button variant="outline" className="flex-1 justify-between font-semibold h-11 bg-background text-text-muted text-sm px-3">
                      End Date
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Filter By Concierge (Optional)</label>
                  <Button variant="outline" className="w-full justify-between font-semibold h-11 bg-background">
                    All Staff <ChevronDown className="w-4 h-4 text-text-muted" />
                  </Button>
                </div>
                
                <div className="pt-4 space-y-3">
                  <Button variant="primary" className="w-full font-bold h-11 gap-2">
                    <FileText className="w-4 h-4" /> Preview Report
                  </Button>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 font-bold h-11 gap-2">
                      <Download className="w-4 h-4" /> CSV
                    </Button>
                    <Button variant="outline" className="flex-1 font-bold h-11 gap-2">
                      <Download className="w-4 h-4" /> PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Report Types / History */}
            <div className="bg-surface border border-border rounded-xl shadow-sm p-6 lg:col-span-2">
              <h2 className="text-base font-bold text-text mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Report History
              </h2>
              <div className="overflow-hidden border border-border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-semibold text-sm">Monthly SLA Review - Aug</TableCell>
                      <TableCell className="text-sm">SLA Performance</TableCell>
                      <TableCell className="text-sm text-text-muted">Aug 1 - Aug 31, 2026</TableCell>
                      <TableCell className="text-sm text-text-muted">Today, 09:14 AM</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-success font-bold text-[11px] uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="font-bold text-primary">Download</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold text-sm">Weekly Emergencies</TableCell>
                      <TableCell className="text-sm">Emergency Cases</TableCell>
                      <TableCell className="text-sm text-text-muted">Aug 18 - Aug 24, 2026</TableCell>
                      <TableCell className="text-sm text-text-muted">Yesterday, 17:00</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-success font-bold text-[11px] uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="font-bold text-primary">Download</Button>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold text-sm">Team Workload Q3</TableCell>
                      <TableCell className="text-sm">Concierge Activity</TableCell>
                      <TableCell className="text-sm text-text-muted">Jul 1 - Sep 30, 2026</TableCell>
                      <TableCell className="text-sm text-text-muted">2 days ago</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-success font-bold text-[11px] uppercase tracking-wider">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="font-bold text-primary">Download</Button>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <h2 className="text-base font-bold text-text mb-4 mt-8">Available Report Types</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REPORT_TYPES.map(report => (
                  <div key={report.id} className="border border-border/50 rounded-lg p-4 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-bold text-text flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" /> {report.label}
                      </h4>
                      <p className="text-xs text-text-muted pl-6">{report.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
