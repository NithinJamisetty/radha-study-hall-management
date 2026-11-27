import React, { useState } from 'react';
import { 
  Zap, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Plus, 
  MessageSquare, 
  Send, 
  Database, 
  Bell, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Settings2,
  AlertTriangle,
  RotateCcw,
  Check
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'processing' | 'delivery';
  label: string;
  detail: string;
  icon: string;
}

interface AutomationFlow {
  id: string;
  title: string;
  category: 'daily_ops' | 'sentinel' | 'finance' | 'facility';
  description: string;
  isActive: boolean;
  schedule: string;
  nodes: WorkflowNode[];
  lastRun?: string;
  executionCount: number;
}

const INITIAL_AUTOMATIONS: AutomationFlow[] = [
  {
    id: 'flow-8pm-whatsapp',
    title: '8:00 PM WhatsApp Daily Report Automation',
    category: 'daily_ops',
    description: 'Auto-aggregates all shifts, fee logs, admissions, and repairs into the official 8:00 PM WhatsApp group dispatch.',
    isActive: true,
    schedule: 'Daily at 20:00 (8:00 PM)',
    executionCount: 142,
    lastRun: 'Today, 20:00',
    nodes: [
      {
        id: 'n1',
        type: 'trigger',
        label: 'Daily Scheduled Trigger',
        detail: 'Every Day at 8:00 PM IST',
        icon: 'clock'
      },
      {
        id: 'n2',
        type: 'action',
        label: 'Collect Daily Shift Data',
        detail: 'Admissions, Fees, Morning & Evening Turnout',
        icon: 'database'
      },
      {
        id: 'n3',
        type: 'processing',
        label: 'Radha Jarvis Compilation',
        detail: 'Format into official WhatsApp Markdown',
        icon: 'sparkles'
      },
      {
        id: 'n4',
        type: 'delivery',
        label: 'WhatsApp Admin Dispatch',
        detail: 'Direct to Admin WhatsApp Group by 8:15 PM',
        icon: 'send'
      }
    ]
  },
  {
    id: 'flow-hourly-sentinel',
    title: 'Hourly Silent Sentinel & Mobile Alert Watcher',
    category: 'sentinel',
    description: 'Monitors quiet hours policy, checks shift attendance turnout, and delivers hourly notifications to mobile.',
    isActive: true,
    schedule: 'Every 60 minutes',
    executionCount: 780,
    lastRun: '12 minutes ago',
    nodes: [
      {
        id: 'n5',
        type: 'trigger',
        label: 'Hourly Cron Trigger',
        detail: 'Every hour on the hour (xx:00)',
        icon: 'clock'
      },
      {
        id: 'n6',
        type: 'processing',
        label: 'Evaluate Study Hall State',
        detail: 'Check open tickets, active shift, & attendance',
        icon: 'sparkles'
      },
      {
        id: 'n7',
        type: 'delivery',
        label: 'Synthesize In-App Alert & Chime',
        detail: 'Web Audio 2-tone ping + phone vibration',
        icon: 'bell'
      }
    ]
  },
  {
    id: 'flow-fee-due-alert',
    title: 'Smart Fee Collection Sentinel',
    category: 'finance',
    description: 'Identifies students whose monthly study hall fee is pending and drafts WhatsApp payment reminder templates.',
    isActive: true,
    schedule: '1st & 15th of every month',
    executionCount: 24,
    lastRun: '15 Nov 2026',
    nodes: [
      {
        id: 'n8',
        type: 'trigger',
        label: 'Monthly Due Date Trigger',
        detail: 'Day 1 & Day 15 at 10:00 AM',
        icon: 'clock'
      },
      {
        id: 'n9',
        type: 'action',
        label: 'Scan 220 Desks Database',
        detail: 'Filter seats where feeStatus == Due',
        icon: 'database'
      },
      {
        id: 'n10',
        type: 'delivery',
        label: 'Prepare WhatsApp Reminder Drafts',
        detail: 'One-click copy & send to students',
        icon: 'send'
      }
    ]
  },
  {
    id: 'flow-maintenance-escalation',
    title: 'AC & Urgent Facility Repair Escalation',
    category: 'facility',
    description: 'Immediately triggers an alert banner and tags the priority as HIGH whenever an AC, fan, or power failure is logged.',
    isActive: true,
    schedule: 'Event-driven (On chat complaint)',
    executionCount: 18,
    lastRun: 'Yesterday, 14:32',
    nodes: [
      {
        id: 'n11',
        type: 'trigger',
        label: 'Event: Complaint Received',
        detail: 'Natural language chat message',
        icon: 'message'
      },
      {
        id: 'n12',
        type: 'processing',
        label: 'Priority AI Classifier',
        detail: 'Detects AC, water, or electrical issues',
        icon: 'sparkles'
      },
      {
        id: 'n13',
        type: 'delivery',
        label: 'Elevate to Top of Dashboard',
        detail: 'Broadcast in-app alert banner to admin',
        icon: 'bell'
      }
    ]
  }
];

export const AutomationStudio: React.FC = () => {
  const [automations, setAutomations] = useState<AutomationFlow[]>(INITIAL_AUTOMATIONS);
  const [runningFlowId, setRunningFlowId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const toggleAutomation = (id: string) => {
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  const handleTestRun = async (flow: AutomationFlow) => {
    setRunningFlowId(flow.id);
    setTestResult(null);

    // Simulate stepping through nodes visually
    await new Promise(r => setTimeout(r, 1200));

    setAutomations(prev => prev.map(a => {
      if (a.id === flow.id) {
        return {
          ...a,
          executionCount: a.executionCount + 1,
          lastRun: 'Just now (Test Successful)'
        };
      }
      return a;
    }));

    setRunningFlowId(null);
    setTestResult(`Workflow "${flow.title}" executed all ${flow.nodes.length} nodes successfully!`);
    setTimeout(() => setTestResult(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 shadow-xl border border-teal-500/20 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-400/30 mb-3">
              <Zap className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span>Visual Workflow Engine &amp; Automation Studio</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              RADHA OS Automation Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Don't fill forms all day. Radha OS automates routine study hall operations: triggers daily 8:00 PM WhatsApp reports, monitors hourly peace, and flags pending fee payments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Automations</span>
              <span className="text-lg font-black text-teal-400">{automations.filter(a => a.isActive).length} / {automations.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Execution Feedback Banner */}
      {testResult && (
        <div className="p-3 bg-teal-500 text-white rounded-2xl text-xs font-bold flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{testResult}</span>
          </div>
        </div>
      )}

      {/* 2. Automation Flow Cards with Interactive Visual Canvas */}
      <div className="space-y-5">
        {automations.map(flow => {
          const isRunning = runningFlowId === flow.id;

          return (
            <div 
              key={flow.id}
              className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs ${
                flow.isActive ? 'border-slate-200/80 hover:border-teal-300' : 'border-slate-200/50 opacity-60'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xs ${
                    flow.isActive ? 'bg-teal-50 text-teal-600 border border-teal-200' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                      {flow.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {flow.description}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  <button
                    onClick={() => handleTestRun(flow)}
                    disabled={isRunning || !flow.isActive}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin text-teal-600' : ''}`} />
                    <span>{isRunning ? 'Executing Nodes...' : 'Test Run'}</span>
                  </button>

                  <button
                    onClick={() => toggleAutomation(flow.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      flow.isActive 
                        ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-xs' 
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {flow.isActive ? 'Active' : 'Paused'}
                  </button>
                </div>
              </div>

              {/* Visual Workflow Canvas Pipeline */}
              <div className="p-5 bg-slate-50/60 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-3 min-w-[650px]">
                  {flow.nodes.map((node, idx) => (
                    <React.Fragment key={node.id}>
                      {/* Node Box */}
                      <div className={`flex-1 p-3.5 rounded-2xl border transition-all ${
                        isRunning 
                          ? 'border-teal-400 bg-teal-50/80 shadow-md ring-2 ring-teal-300' 
                          : 'bg-white border-slate-200/80 shadow-2xs hover:border-slate-300'
                      }`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            node.type === 'trigger' ? 'bg-amber-100 text-amber-800' :
                            node.type === 'action' ? 'bg-sky-100 text-sky-800' :
                            node.type === 'processing' ? 'bg-purple-100 text-purple-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {node.type}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">Step {idx + 1}</span>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 leading-tight">
                          {node.label}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                          {node.detail}
                        </p>
                      </div>

                      {/* Connector Arrow */}
                      {idx < flow.nodes.length - 1 && (
                        <div className="flex-shrink-0 text-slate-300">
                          <ArrowRight className={`w-4 h-4 ${isRunning ? 'text-teal-500 animate-pulse' : ''}`} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Card Footer Meta */}
              <div className="px-5 py-2.5 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span>Schedule: <strong className="text-slate-700">{flow.schedule}</strong></span>
                  <span>&bull;</span>
                  <span>Executed: <strong className="text-slate-700">{flow.executionCount} times</strong></span>
                </div>
                <span>Last run: <strong className="text-slate-700">{flow.lastRun}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
