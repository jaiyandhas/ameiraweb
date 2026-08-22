import React, { useMemo } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { WelcomeHeader } from '../features/dashboard/WelcomeHeader';
import { ActivityFeed } from '../features/dashboard/ActivityFeed';
import { WorkspaceOverview } from '../features/dashboard/WorkspaceOverview';
import { QuickActions } from '../features/dashboard/QuickActions';
import { SetupChecklist } from '../features/dashboard/SetupChecklist';
import type { SetupStepItem } from '../features/dashboard/SetupChecklist';

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

  const activeMembers = people.filter(p => p.status === 'active').length;
  const customRoles = roles.filter(r => !r.isPreset).length;

  const hasInvitedAnyone = people.length > 1;
  const hasCreatedRole = customRoles > 0;
  const hasUpdatedProfile = false;

  const setupSteps = useMemo<SetupStepItem[]>(() => [
    { done: true, label: 'Create your workspace' },
    { done: hasInvitedAnyone, label: 'Invite your first team member', actionLabel: 'Invite someone', onAction: onNavigateInvite },
    { done: hasCreatedRole, label: 'Create a custom role', actionLabel: 'Create role', onAction: onNavigateCreateRole },
    { done: hasUpdatedProfile, label: 'Set up your business profile', actionLabel: 'Open settings', onAction: () => onNavigate('settings') },
  ], [hasInvitedAnyone, hasCreatedRole, hasUpdatedProfile, onNavigateInvite, onNavigateCreateRole, onNavigate]);

  return (
    <div className="max-w-5xl mx-auto">
      {/* 1. Welcome Greeting */}
      <WelcomeHeader
        userName={user?.fullName}
        businessName={business?.name}
      />

      {/* 2. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Activity Feed + Workspace Overview */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <ActivityFeed activities={activities} />
          <WorkspaceOverview
            activeMembers={activeMembers}
            rolesCount={roles.length}
            createdAt={business?.createdAt}
          />
        </div>

        {/* Right Column: Quick Actions + Setup Checklist */}
        <div className="flex flex-col gap-6">
          <QuickActions
            onNavigateInvite={onNavigateInvite}
            onNavigateCreateRole={onNavigateCreateRole}
            onNavigateSettings={() => onNavigate('settings')}
          />
          <SetupChecklist steps={setupSteps} />
        </div>
      </div>
    </div>
  );
};
