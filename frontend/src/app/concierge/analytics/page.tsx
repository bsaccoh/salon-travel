'use client';

import React from 'react';
import { ConciergeSidebar } from '@/components/concierge/sidebar';
import { Button } from '@/components/ui/button';
import { Activity, Clock, ShieldAlert, MessageCircle, CheckCircle2, Users, Download, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useConciergeStats } from '@/hooks/use-admin';

export default function ConciergeAnalyticsPage() {
  const { data: stats, isLoading } = useConciergeStats();

  return (
    <div className="grid grid-rows-1 h-screen overflow-hidden bg-background text-text grid-cols-[80px_1fr] lg:grid-cols-[260px_1fr]">
      <ConciergeSidebar />
      <main className="min-h-0 flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-[#FAFCFC]">
        {/* Page Header */}
        <div className="px-8 py-6 border-b border-border bg-surface sticky top-0 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">Analytics</h1>
            <p className="text-sm text-text-muted mt-1">Review operational performance, workloads, and SLA compliance.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="font-bold gap-2">
              <CalendarIcon className="w-4 h-4" />
              Last 30 Days
            </Button>
            <Button variant="primary" size="sm" className="font-bold gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </div>
        </div>

        <div className="p-8 max-w-[1400px] w-full mx-auto space-y-8">
          {/* Top KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-surface border border-border rounded-xl p-4 shadow-sm col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-4 h-4 text-text-muted" />
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Open Cases</span>
              </div>
              <div className="text-2xl font-extrabold text-text">{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.openCases ?? 0}</div>
              <div className="text-[11px] font-semibold text-text-muted mt-1">Active conversations</div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 shadow-sm col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Unclaimed</span>
              </div>
              <div className="text-2xl font-extrabold text-text">{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.unclaimedConversations ?? 0}</div>
              <div className="text-[11px] font-semibold text-warning mt-1">Awaiting assignment</div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 shadow-sm col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-warning" />
                <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Today's Bookings</span>
              </div>
              <div className="text-2xl font-extrabold text-text">{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.todaysBookings ?? 0}</div>
              <div className="text-[11px] font-semibold text-text-muted mt-1">Bookings needing attention</div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-4 shadow-sm col-span-2 border-l-4 border-l-danger">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-danger" />
                <span className="text-xs font-bold text-danger uppercase tracking-wider">Emergencies</span>
              </div>
              <div className="text-2xl font-extrabold text-danger">{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats?.emergencyConversations ?? 0}</div>
              <div className="text-[11px] font-semibold text-text-muted mt-1">Requires immediate action</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Conversation Trend Chart (Mock) */}
            <div className="bg-surface border border-border rounded-xl shadow-sm p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-bold text-text flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" /> Conversation Volume Trend
                </h2>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[11px] font-bold text-text-muted uppercase"><span className="w-2 h-2 rounded-full bg-primary" /> Incoming</span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-text-muted uppercase"><span className="w-2 h-2 rounded-full bg-success" /> Resolved</span>
                </div>
              </div>
              <div className="flex-1 min-h-[250px] border-b border-l border-border/50 relative">
                {/* Mock Chart Visualization */}
                <div className="absolute bottom-0 left-[10%] w-[5%] bg-primary/20 rounded-t-sm" style={{ height: '40%' }}></div>
                <div className="absolute bottom-0 left-[12%] w-[5%] bg-success/80 rounded-t-sm" style={{ height: '35%' }}></div>
                
                <div className="absolute bottom-0 left-[25%] w-[5%] bg-primary/20 rounded-t-sm" style={{ height: '60%' }}></div>
                <div className="absolute bottom-0 left-[27%] w-[5%] bg-success/80 rounded-t-sm" style={{ height: '55%' }}></div>
                
                <div className="absolute bottom-0 left-[40%] w-[5%] bg-primary/20 rounded-t-sm" style={{ height: '80%' }}></div>
                <div className="absolute bottom-0 left-[42%] w-[5%] bg-success/80 rounded-t-sm" style={{ height: '70%' }}></div>
                
                <div className="absolute bottom-0 left-[55%] w-[5%] bg-primary/20 rounded-t-sm" style={{ height: '45%' }}></div>
                <div className="absolute bottom-0 left-[57%] w-[5%] bg-success/80 rounded-t-sm" style={{ height: '45%' }}></div>
                
                <div className="absolute bottom-0 left-[70%] w-[5%] bg-primary/20 rounded-t-sm" style={{ height: '90%' }}></div>
                <div className="absolute bottom-0 left-[72%] w-[5%] bg-success/80 rounded-t-sm" style={{ height: '85%' }}></div>
                
                <div className="absolute bottom-0 left-[85%] w-[5%] bg-primary/20 rounded-t-sm" style={{ height: '65%' }}></div>
                <div className="absolute bottom-0 left-[87%] w-[5%] bg-success/80 rounded-t-sm" style={{ height: '60%' }}></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-text-muted font-medium px-4">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* SLA Compliance (Mock) */}
            <div className="bg-surface border border-border rounded-xl shadow-sm p-6">
              <h2 className="text-base font-bold text-text mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> SLA Analytics
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Average First Response Time</span>
                    <span className="text-xl font-extrabold text-text">3m 45s</span>
                  </div>
                  <div className="w-full bg-slate-light h-2.5 rounded-full overflow-hidden">
                    <div className="bg-success h-full w-[90%] rounded-full" />
                  </div>
                  <p className="text-[11px] text-text-muted mt-1.5 font-medium">Target: &lt; 5m</p>
                </div>
                
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Average Resolution Time</span>
                    <span className="text-xl font-extrabold text-text">21m 30s</span>
                  </div>
                  <div className="w-full bg-slate-light h-2.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[75%] rounded-full" />
                  </div>
                  <p className="text-[11px] text-text-muted mt-1.5 font-medium">Target: &lt; 30m</p>
                </div>

                <div className="pt-6 border-t border-border grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-extrabold text-success">96%</div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">SLA Compliance</div>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-danger">12</div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">SLA Breaches</div>
                  </div>
                  <div>
                    <div className="text-2xl font-extrabold text-text">2m 10s</div>
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">Median Response</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Status Distribution */}
            <div className="bg-surface border border-border rounded-xl shadow-sm p-6 lg:col-span-1">
              <h2 className="text-base font-bold text-text mb-6">Conversation Status</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm font-semibold text-text">Assigned & Active</span>
                  </div>
                  <span className="text-sm font-bold">45%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span className="text-sm font-semibold text-text">Waiting on Traveler</span>
                  </div>
                  <span className="text-sm font-bold">25%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#5E7078]" />
                    <span className="text-sm font-semibold text-text">Waiting on Provider</span>
                  </div>
                  <span className="text-sm font-bold">20%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-danger" />
                    <span className="text-sm font-semibold text-text">Emergency</span>
                  </div>
                  <span className="text-sm font-bold">10%</span>
                </div>
              </div>
              
              {/* Mock horizontal bar */}
              <div className="flex h-3 w-full rounded-full overflow-hidden mt-6">
                <div className="bg-primary h-full" style={{ width: '45%' }} />
                <div className="bg-warning h-full" style={{ width: '25%' }} />
                <div className="bg-[#5E7078] h-full" style={{ width: '20%' }} />
                <div className="bg-danger h-full" style={{ width: '10%' }} />
              </div>
            </div>

            {/* Team Workload */}
            <div className="bg-surface border border-border rounded-xl shadow-sm p-6 lg:col-span-2 overflow-hidden">
              <h2 className="text-base font-bold text-text mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> Concierge Team Workload
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 font-bold text-text-muted uppercase text-xs tracking-wider">Concierge</th>
                      <th className="pb-3 font-bold text-text-muted uppercase text-xs tracking-wider text-center">Active</th>
                      <th className="pb-3 font-bold text-text-muted uppercase text-xs tracking-wider text-center">Resolved Today</th>
                      <th className="pb-3 font-bold text-text-muted uppercase text-xs tracking-wider text-center">Avg Response</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    <tr>
                      <td className="py-3 font-semibold flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center text-[10px]">A</div>
                        Aminata Koroma
                      </td>
                      <td className="py-3 text-center font-bold">12</td>
                      <td className="py-3 text-center text-success font-bold">45</td>
                      <td className="py-3 text-center font-medium text-text-muted">3m 12s</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-light text-text flex items-center justify-center text-[10px]">D</div>
                        David Vance
                      </td>
                      <td className="py-3 text-center font-bold">18</td>
                      <td className="py-3 text-center text-success font-bold">38</td>
                      <td className="py-3 text-center font-medium text-text-muted">4m 05s</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-light text-text flex items-center justify-center text-[10px]">S</div>
                        Sarah Conteh
                      </td>
                      <td className="py-3 text-center font-bold text-warning">24</td>
                      <td className="py-3 text-center text-success font-bold">52</td>
                      <td className="py-3 text-center font-medium text-text-muted">5m 30s</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
