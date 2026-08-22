import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Plus, Shield, ChevronRight, Users, CheckCircle2 } from 'lucide-react';

interface RolesPageProps {
  onNavigateCreateRole: () => void;
  onSelectRole: (roleId: string) => void;
}

export const RolesPage: React.FC<RolesPageProps> = ({
  onNavigateCreateRole,
  onSelectRole
}) => {
  const { roles, people, capabilities } = useWorkspace();

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Access Levels"
        subtitle="Define what each job role or team member is allowed to access and manage."
        action={
          <Button size="lg" onClick={onNavigateCreateRole} className="px-6 shadow-sm">
            <Plus className="h-5 w-5" />
            Create Access Level
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => {
          const assignedMemberCount = people.filter(p => p.roleId === role.id).length;
          const isOwner = role.isPreset && role.name === 'Owner';
          
          const grantedCapabilityTitles = role.capabilities
            .map(capId => capabilities.find(c => c.id === capId)?.title)
            .filter(Boolean);

          return (
            <Card
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              hoverable
              className="flex flex-col justify-between p-6 sm:p-8 rounded-3xl border-zinc-200/80 hover:border-zinc-300 transition-all cursor-pointer group shadow-sm bg-white"
            >
              <div>
                {/* Header & Badges */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-colors shrink-0">
                      <Shield className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900">{role.name}</h3>
                  </div>

                  {role.isPreset ? (
                    <Badge variant="neutral">System Standard</Badge>
                  ) : (
                    <Badge variant="default">Custom Level</Badge>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-zinc-500 leading-relaxed mb-6">
                  {role.description}
                </p>

                {/* Capabilities Summary */}
                <div className="pt-4 border-t border-zinc-100">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
                    Capabilities Granted ({isOwner ? 'Full Access' : role.capabilities.length})
                  </span>
                  
                  {isOwner ? (
                    <div className="flex items-center gap-2 text-xs font-semibold text-zinc-700 bg-zinc-50 border border-zinc-200/80 px-3 py-2 rounded-xl">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Full administrative control over all workspace tools & settings</span>
                    </div>
                  ) : grantedCapabilityTitles.length === 0 ? (
                    <span className="text-xs text-zinc-400 italic block py-1">
                      Standard member access (No administrative permissions)
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {grantedCapabilityTitles.map((title, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-zinc-100 text-zinc-800 rounded-lg text-xs font-semibold">
                          {title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer: Member count + Call to action */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-zinc-100 text-sm">
                <div className="flex items-center gap-2 text-zinc-600 font-medium">
                  <Users className="h-4 w-4 text-zinc-400" />
                  <span>{assignedMemberCount} {assignedMemberCount === 1 ? 'person' : 'people'} assigned</span>
                </div>

                <span className="text-zinc-900 font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View Access <ChevronRight className="h-4 w-4" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
