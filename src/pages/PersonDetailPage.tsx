import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Alert } from '../components/ui/Alert';
import { Check, Trash2, Shield, Clock, AlertTriangle } from 'lucide-react';

interface PersonDetailPageProps {
  personId: string;
  onBack: () => void;
}

export const PersonDetailPage: React.FC<PersonDetailPageProps> = ({
  personId,
  onBack
}) => {
  const { people, roles, activities, updatePersonRole, removePerson, getRoleById } = useWorkspace();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const person = people.find(p => p.id === personId);

  if (!person) {
    return (
      <div className="max-w-2xl mx-auto">
        <PageHeader title="Person Not Found" onBack={onBack} />
        <Card className="p-12 text-center text-zinc-500 rounded-3xl">
          This team member no longer exists in your business workspace.
        </Card>
      </div>
    );
  }

  const currentRole = getRoleById(person.roleId);
  const isOwner = currentRole?.name === 'Owner' || person.roleId === 'role-owner';

  // Count total active owners in workspace
  const activeOwners = people.filter(p => {
    const r = getRoleById(p.roleId);
    return (r?.name === 'Owner' || p.roleId === 'role-owner') && p.status === 'active';
  });
  const isSoleOwner = isOwner && activeOwners.length <= 1;

  // Filter recent activity involving this person's name or contact
  const personActivities = activities.filter(act => 
    act.title.toLowerCase().includes(person.fullName.toLowerCase()) ||
    act.title.toLowerCase().includes(person.emailOrPhone.toLowerCase())
  );

  const handleRoleChange = async (newRoleId: string) => {
    if (newRoleId === person.roleId) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsUpdating(true);

    const res = await updatePersonRole(person.id, newRoleId);
    setIsUpdating(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to update access level.');
    } else {
      const newRoleName = getRoleById(newRoleId)?.name || 'Access Level';
      setSuccessMessage(`Access level updated to "${newRoleName}".`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleRemove = async () => {
    if (isSoleOwner) {
      setErrorMessage('Cannot remove the sole Owner of the workspace. Designate another Owner first.');
      return;
    }

    if (window.confirm(`Are you sure you want to remove ${person.fullName} from your business workspace?`)) {
      const res = await removePerson(person.id);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to remove team member.');
      } else {
        onBack();
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title={person.fullName}
        subtitle={`Member since ${person.joinedAt} • ${person.emailOrPhone}`}
        onBack={onBack}
        action={
          !isSoleOwner ? (
            <Button variant="danger" size="md" onClick={handleRemove}>
              <Trash2 className="h-4 w-4" />
              Remove Person
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-8">
        {errorMessage && <Alert type="error" message={errorMessage} />}
        {successMessage && <Alert type="success" message={successMessage} />}

        {/* Identity & Status Overview */}
        <Card className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-3xl bg-zinc-900 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
              {person.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900">{person.fullName}</h2>
              <p className="text-sm font-medium text-zinc-500 mt-0.5">{person.emailOrPhone}</p>
              <div className="mt-2 flex items-center gap-2">
                {person.status === 'invited' ? (
                  <Badge variant="warning">Invite Pending</Badge>
                ) : (
                  <Badge variant="success">Active Member</Badge>
                )}
                <span className="text-xs text-zinc-400">•</span>
                <span className="text-xs text-zinc-500 font-medium">Joined {person.joinedAt}</span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 w-full sm:w-auto border-zinc-100">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest block">Current Access Level</span>
            <span className="text-lg font-extrabold text-zinc-900 block mt-1">
              {currentRole?.name || 'Staff'}
            </span>
          </div>
        </Card>

        {/* Sole Owner Banner if applicable */}
        {isSoleOwner && (
          <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3.5 text-amber-900">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold">Sole Workspace Owner</p>
              <p className="text-amber-800 mt-0.5 leading-relaxed">
                This person is currently the only active Owner. To modify their role or remove them, you must first assign the Owner role to another team member to prevent workspace lockout.
              </p>
            </div>
          </div>
        )}

        {/* Access Level Selector */}
        <Card className="flex flex-col gap-6 p-6 sm:p-8">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Shield className="h-5 w-5 text-zinc-900" />
              What can this person do? (Access Level)
            </h3>
            <p className="text-sm text-zinc-500 mt-2">
              Choose the access level that defines this person's permissions in your workspace.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {roles.map((role) => {
              const isSelected = person.roleId === role.id;
              const isOptionDisabled = isSoleOwner && role.name !== 'Owner';

              return (
                <div
                  key={role.id}
                  onClick={() => !isOptionDisabled && !isUpdating && handleRoleChange(role.id)}
                  className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    isOptionDisabled
                      ? 'opacity-40 cursor-not-allowed bg-zinc-50 border-zinc-200'
                      : isSelected
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-md ring-2 ring-zinc-900 ring-offset-2 cursor-default'
                      : 'bg-white text-zinc-900 border-zinc-200 hover:border-zinc-300 cursor-pointer'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-base font-bold ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                        {role.name}
                      </h4>
                      {role.isPreset && (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          isSelected ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          Standard
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                      {role.description}
                    </p>
                  </div>

                  <div className={`mt-1 h-6 w-6 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white border-white text-zinc-900' : 'border-zinc-300 text-transparent'
                  }`}>
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Activity Feed for this Person */}
        <Card className="flex flex-col gap-6 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Clock className="h-5 w-5 text-zinc-900" />
            Activity History
          </h3>

          {personActivities.length === 0 ? (
            <div className="py-6 text-center text-sm text-zinc-400">
              No recent activity recorded for {person.fullName}.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {personActivities.map((act) => (
                <div key={act.id} className="py-3.5 flex items-center justify-between text-sm">
                  <span className="font-semibold text-zinc-800">{act.title}</span>
                  <span className="text-xs text-zinc-400 shrink-0 ml-4">
                    {new Date(act.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
