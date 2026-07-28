import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Plus, Shield, ChevronRight } from 'lucide-react';
import { CAPABILITY_DEFINITIONS } from '../types';

interface RolesPageProps {
  onNavigateCreateRole: () => void;
  onSelectRole: (roleId: string) => void;
}

export const RolesPage: React.FC<RolesPageProps> = ({
  onNavigateCreateRole,
  onSelectRole
}) => {
  const { roles, people } = useWorkspace();

  return (
    <div>
      <PageHeader
        title="Roles & Access"
        subtitle="Define job roles for your team and control what each role is allowed to access."
        action={
          <Button onClick={onNavigateCreateRole}>
            <Plus className="h-5 w-5" />
            Create Custom Role
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => {
          const assignedMemberCount = people.filter(p => p.roleId === role.id).length;
          const capabilityTitles = role.capabilities
            .map(capId => CAPABILITY_DEFINITIONS.find(c => c.id === capId)?.title)
            .filter(Boolean);

          return (
            <Card
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              hoverable
              className="flex flex-col justify-between gap-6"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <Shield className="h-5 w-5 text-zinc-900" />
                    <h3 className="text-lg font-bold text-zinc-900">{role.name}</h3>
                  </div>

                  {role.isPreset ? (
                    <Badge variant="neutral">System Preset</Badge>
                  ) : (
                    <Badge variant="default">Custom Role</Badge>
                  )}
                </div>

                <p className="text-sm text-zinc-500 leading-relaxed mb-4">
                  {role.description}
                </p>

                {/* Capability Badges */}
                <div className="flex flex-wrap gap-1.5 pt-3 border-t border-zinc-100">
                  {capabilityTitles.length === 0 ? (
                    <span className="text-xs text-zinc-400 italic">No administrative capabilities (Standard Access)</span>
                  ) : (
                    capabilityTitles.map((title, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-zinc-100 text-zinc-700 rounded-md text-xs font-medium">
                        {title}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-zinc-100 text-sm">
                <span className="font-semibold text-zinc-600">
                  {assignedMemberCount} {assignedMemberCount === 1 ? 'person assigned' : 'people assigned'}
                </span>
                <span className="text-zinc-900 font-semibold inline-flex items-center gap-1 group">
                  View Details <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
