import React, { useMemo } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import type { ActivityEvent } from '../types';
import {
  Building2,
  UserPlus,
  Shield,
  CheckCircle2,
  Circle,
  ArrowRight,
  Users,
  ShieldCheck,
  Briefcase,
  Store,
  FileText,
  Settings2,
} from 'lucide-react';

// ─── Relative timestamp helper ────────────────────────────────────────────────
function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ─── Time-aware greeting ──────────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// ─── Activity icon mapping ────────────────────────────────────────────────────
function activityMeta(type: ActivityEvent['type']): {
  Icon: React.FC<{ className?: string }>;
  bg: string;
  color: string;
} {
  switch (type) {
    case 'business_created':
      return { Icon: Building2, bg: 'bg-zinc-100', color: 'text-zinc-700' };
    case 'person_invited':
    case 'person_joined':
      return { Icon: UserPlus, bg: 'bg-emerald-50', color: 'text-emerald-700' };
    case 'role_created':
    case 'role_assigned':
      return { Icon: ShieldCheck, bg: 'bg-blue-50', color: 'text-blue-700' };
    case 'settings_updated':
      return { Icon: Settings2, bg: 'bg-amber-50', color: 'text-amber-700' };
    default:
      return { Icon: FileText, bg: 'bg-zinc-100', color: 'text-zinc-500' };
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface QuickActionCardProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  description: string;
  onClick: () => void;
}
const QuickActionCard: React.FC<QuickActionCardProps> = ({ icon: Icon, label, description, onClick }) => (
  <button
    onClick={onClick}
    className="group w-full text-left bg-white border border-zinc-200/80 rounded-2xl p-5 hover:border-zinc-400 hover:shadow-sm transition-all duration-150"
  >
    <div className="flex items-center justify-between">
      <div className="h-9 w-9 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 transition-colors duration-150">
        <Icon className="h-4 w-4 text-zinc-700 group-hover:text-white transition-colors duration-150" />
      </div>
      <ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-zinc-600 transition-colors duration-150" />
    </div>
    <p className="font-semibold text-zinc-900 mt-3 text-sm">{label}</p>
    <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{description}</p>
  </button>
);

interface SetupStepProps {
  done: boolean;
  label: string;
  actionLabel?: string;
  onAction?: () => void;
}
const SetupStep: React.FC<SetupStepProps> = ({ done, label, actionLabel, onAction }) => (
  <div className="flex items-center justify-between py-3 border-b border-zinc-100 last:border-0">
    <div className="flex items-center gap-3">
      {done
        ? <CheckCircle2 className="h-5 w-5 text-zinc-900 shrink-0" />
        : <Circle className="h-5 w-5 text-zinc-300 shrink-0" />
      }
      <span className={`text-sm font-medium ${done ? 'text-zinc-400 line-through' : 'text-zinc-800'}`}>
        {label}
      </span>
    </div>
    {!done && actionLabel && onAction && (
      <button
        onClick={onAction}
        className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        {actionLabel} →
      </button>
    )}
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────

interface DashboardPageProps {
  onNavigate: (tab: 'dashboard' | 'apps' | 'people' | 'roles' | 'settings') => void;
  onNavigateInvite: () => void;
  onNavigateCreateRole: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onNavigateInvite,
  onNavigateCreateRole,
}) => {
  const { user, business, people, roles, activities } = useWorkspace();

  const greeting = getGreeting();
  const firstName = user?.fullName?.split(' ')[0] ?? 'there';
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

  const activeMembers = people.filter(p => p.status === 'active').length;
  const customRoles = roles.filter(r => !r.isPreset).length;

  // ── Setup checklist ──────────────────────────────────────────────────────
  const hasInvitedAnyone = people.length > 1;
  const hasCreatedRole = customRoles > 0;
  const hasUpdatedProfile = false; // future: track this

  const setupSteps = useMemo(() => [
    { done: true, label: 'Create your workspace' },
    { done: hasInvitedAnyone, label: 'Invite your first team member', actionLabel: 'Invite someone', onAction: onNavigateInvite },
    { done: hasCreatedRole, label: 'Create a custom role', actionLabel: 'Create role', onAction: onNavigateCreateRole },
    { done: hasUpdatedProfile, label: 'Set up your business profile', actionLabel: 'Open settings', onAction: () => onNavigate('settings') },
  ], [hasInvitedAnyone, hasCreatedRole, hasUpdatedProfile, onNavigateInvite, onNavigateCreateRole, onNavigate]);

  const allSetupDone = setupSteps.every(s => s.done);
  const completedSteps = setupSteps.filter(s => s.done).length;

  return (
    <div className="max-w-5xl mx-auto">

      {/* ── Welcome ─────────────────────────────────────────────────────── */}
      <div className="mb-10">
        <p className="text-sm font-medium text-zinc-400 mb-1">{today}</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
          {greeting}, {firstName}.
        </h1>
        {business && (
          <p className="text-base text-zinc-500 mt-2">
            Here is what happened in <span className="font-semibold text-zinc-700">{business.name}</span> today.
          </p>
        )}
      </div>

      {/* ── Two-column layout ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Activity Feed ─────────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Activity Feed */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden">
            <div className="px-6 pt-6 pb-4 border-b border-zinc-100">
              <h2 className="text-base font-bold text-zinc-900">Today's Activity</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Everything that happened in your workspace.</p>
            </div>

            {activities.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="h-5 w-5 text-zinc-400" />
                </div>
                <p className="text-sm font-semibold text-zinc-700">Your workspace is ready.</p>
                <p className="text-xs text-zinc-400 mt-1">Activity will appear here as your team gets started.</p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {activities.map(event => {
                  const { Icon, bg, color } = activityMeta(event.type);
                  return (
                    <li key={event.id} className="flex items-center gap-4 px-6 py-4">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 leading-snug">{event.title}</p>
                      </div>
                      <span className="text-xs font-mono text-zinc-400 shrink-0 tabular-nums">
                        {relativeTime(event.timestamp)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Workspace Overview */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6">
            <h2 className="text-base font-bold text-zinc-900 mb-5">Workspace Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-1">
                  <Users className="h-5 w-5 text-zinc-700" />
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-zinc-900">{activeMembers}</p>
                <p className="text-xs font-medium text-zinc-500">Active members</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-1">
                  <Shield className="h-5 w-5 text-zinc-700" />
                </div>
                <p className="text-3xl font-extrabold tracking-tight text-zinc-900">{roles.length}</p>
                <p className="text-xs font-medium text-zinc-500">Roles defined</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center mb-1">
                  <Store className="h-5 w-5 text-zinc-700" />
                </div>
                <p className="text-sm font-bold tracking-tight text-zinc-900 leading-snug mt-1">
                  {business?.createdAt
                    ? new Date(business.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '—'}
                </p>
                <p className="text-xs font-medium text-zinc-500">Workspace created</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Quick Actions + Setup Progress ──────────────────── */}
        <div className="flex flex-col gap-6">

          {/* Quick Actions */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6">
            <h2 className="text-base font-bold text-zinc-900 mb-4">Quick Actions</h2>
            <div className="flex flex-col gap-3">
              <QuickActionCard
                icon={UserPlus}
                label="Invite someone"
                description="Add a team member to your workspace."
                onClick={onNavigateInvite}
              />
              <QuickActionCard
                icon={Shield}
                label="Create a role"
                description="Define what your team members can see and do."
                onClick={onNavigateCreateRole}
              />
              <QuickActionCard
                icon={Building2}
                label="Business profile"
                description="Update your business name and details."
                onClick={() => onNavigate('settings')}
              />
            </div>
          </div>

          {/* Setup Progress — hidden when all done */}
          {!allSetupDone && (
            <div className="bg-white border border-zinc-200/80 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-base font-bold text-zinc-900">Getting Started</h2>
                <span className="text-xs font-semibold text-zinc-400">{completedSteps}/{setupSteps.length}</span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-zinc-100 rounded-full mb-5 overflow-hidden">
                <div
                  className="h-full bg-zinc-900 rounded-full transition-all duration-500"
                  style={{ width: `${(completedSteps / setupSteps.length) * 100}%` }}
                />
              </div>
              <div>
                {setupSteps.map((step, i) => (
                  <SetupStep
                    key={i}
                    done={step.done}
                    label={step.label}
                    actionLabel={step.actionLabel}
                    onAction={step.onAction}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
