import React from 'react';
import { ArrowRight } from 'lucide-react';

interface QuickActionCardProps {
  label: string;
  description: string;
  onClick: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ label, description, onClick }) => (
  <button
    onClick={onClick}
    className="group w-full text-left bg-white border border-zinc-200/80 rounded-2xl p-5 hover:border-zinc-400 hover:shadow-sm transition-all duration-150 flex items-center justify-between gap-4"
  >
    <div>
      <p className="font-semibold text-zinc-900 text-sm group-hover:text-zinc-900 transition-colors">{label}</p>
      <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{description}</p>
    </div>
    <div className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center shrink-0 group-hover:bg-zinc-900 group-hover:text-white transition-colors duration-150">
      <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-white transition-colors duration-150" />
    </div>
  </button>
);

interface QuickActionsProps {
  onNavigateInvite: () => void;
  onNavigateCreateRole: () => void;
  onNavigateSettings: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onNavigateInvite,
  onNavigateCreateRole,
  onNavigateSettings,
}) => {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6">
      <h2 className="text-base font-bold text-zinc-900 mb-4">Quick Actions</h2>
      <div className="flex flex-col gap-3">
        <QuickActionCard
          label="Invite someone"
          description="Add a team member to your workspace."
          onClick={onNavigateInvite}
        />
        <QuickActionCard
          label="Create a role"
          description="Define what your team members can see and do."
          onClick={onNavigateCreateRole}
        />
        <QuickActionCard
          label="Business profile"
          description="Update your business name and details."
          onClick={onNavigateSettings}
        />
      </div>
    </div>
  );
};
