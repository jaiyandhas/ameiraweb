import React from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Check, Trash2 } from 'lucide-react';

interface PersonDetailPageProps {
  personId: string;
  onBack: () => void;
}

export const PersonDetailPage: React.FC<PersonDetailPageProps> = ({
  personId,
  onBack
}) => {
  const { people, roles, updatePersonRole, removePerson, getRoleById } = useWorkspace();
  const person = people.find(p => p.id === personId);

  if (!person) {
    return (
      <div>
        <PageHeader title="Person Not Found" onBack={onBack} />
        <Card className="p-8 text-center text-zinc-500">
          This team member no longer exists in your business workspace.
        </Card>
      </div>
    );
  }

  const currentRole = getRoleById(person.roleId);
  const isOwnerRole = currentRole?.id === 'role-owner';

  const handleRoleChange = (newRoleId: string) => {
    updatePersonRole(person.id, newRoleId);
  };

  const handleRemove = () => {
    if (window.confirm(`Are you sure you want to remove ${person.fullName} from your business?`)) {
      removePerson(person.id);
      onBack();
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={person.fullName}
        subtitle={`Joined ${person.joinedAt} • ${person.emailOrPhone}`}
        onBack={onBack}
        action={
          !isOwnerRole && (
            <Button variant="danger" size="md" onClick={handleRemove}>
              <Trash2 className="h-4 w-4" />
              Remove Person
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-6">
        {/* Status Card */}
        <Card className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Account Status</h4>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-lg font-bold text-zinc-900 capitalize">{person.status}</span>
              {person.status === 'invited' && <Badge variant="warning">Invite Pending</Badge>}
              {person.status === 'active' && <Badge variant="success">Active Member</Badge>}
            </div>
          </div>
          <div className="text-right">
            <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Current Role</h4>
            <p className="text-lg font-bold text-zinc-900 mt-1">{currentRole?.name || 'Staff'}</p>
          </div>
        </Card>

        {/* Change Role Section */}
        <Card className="flex flex-col gap-6">
          <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            Assigned Job Role
          </h3>

          {isOwnerRole ? (
            <p className="text-sm text-zinc-500 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              The Owner role has full control over the business and cannot be changed or restricted.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {roles.map((role) => {
                const isSelected = person.roleId === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => handleRoleChange(role.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                      isSelected
                        ? 'bg-zinc-900 text-white border-zinc-900 shadow-md'
                        : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div>
                      <h4 className={`text-base font-semibold ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                        {role.name}
                      </h4>
                      <p className={`text-sm mt-1 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                        {role.description}
                      </p>
                    </div>

                    <div className={`mt-0.5 h-6 w-6 rounded-full border flex items-center justify-center ${
                      isSelected ? 'bg-white border-white text-zinc-900' : 'border-zinc-300 text-transparent'
                    }`}>
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
