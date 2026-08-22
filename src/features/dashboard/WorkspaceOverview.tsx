import React from 'react';

interface WorkspaceOverviewProps {
  activeMembers: number;
  rolesCount: number;
  createdAt?: string;
}

export const WorkspaceOverview: React.FC<WorkspaceOverviewProps> = ({
  activeMembers,
  rolesCount,
  createdAt,
}) => {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6">
      <h2 className="text-base font-bold text-zinc-900 mb-6">Workspace Overview</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="flex flex-col gap-1 border-r border-zinc-100 pr-4 last:border-0">
          <p className="text-3xl font-extrabold tracking-tight text-zinc-900">{activeMembers}</p>
          <p className="text-xs font-medium text-zinc-500">Active members</p>
        </div>
        <div className="flex flex-col gap-1 border-r border-zinc-100 pr-4 last:border-0">
          <p className="text-3xl font-extrabold tracking-tight text-zinc-900">{rolesCount}</p>
          <p className="text-xs font-medium text-zinc-500">Roles defined</p>
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 leading-tight mt-1">
            {createdAt
              ? new Date(createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'}
          </p>
          <p className="text-xs font-medium text-zinc-500">Workspace created</p>
        </div>
      </div>
    </div>
  );
};
