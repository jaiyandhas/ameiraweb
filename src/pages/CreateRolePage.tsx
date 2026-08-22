import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { CapabilityCard } from '../components/ui/CapabilityCard';
import type { CapabilityId } from '../types';
import { Trash2, Lock, ArrowRight, Loader2 } from 'lucide-react';

interface CreateRolePageProps {
  roleId?: string;
  onBack: () => void;
  onSuccess: () => void;
}

export const CreateRolePage: React.FC<CreateRolePageProps> = ({
  roleId,
  onBack,
  onSuccess
}) => {
  const { 
    createRole, 
    updateRole, 
    deleteRole, 
    getRoleById, 
    capabilities, 
    people 
  } = useWorkspace();
  
  const existingRole = roleId ? getRoleById(roleId) : undefined;

  const [name, setName] = useState(existingRole?.name || '');
  const [description, setDescription] = useState(existingRole?.description || '');
  const [selectedCapabilities, setSelectedCapabilities] = useState<CapabilityId[]>(
    existingRole?.capabilities || []
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isOwner = existingRole?.isPreset && existingRole?.name === 'Owner';
  const isPreset = existingRole?.isPreset;
  const assignedPeopleCount = existingRole ? people.filter(p => p.roleId === existingRole.id).length : 0;

  const toggleCapability = (id: CapabilityId) => {
    if (isOwner) return;
    setSelectedCapabilities(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter a title for this access level');
      return;
    }

    setIsSaving(true);
    try {
      if (existingRole) {
        const res = await updateRole(existingRole.id, name.trim(), description.trim(), selectedCapabilities);
        if (!res.success) {
          setErrorMessage(res.error || 'Failed to update access level.');
          setIsSaving(false);
          return;
        }
      } else {
        await createRole(name.trim(), description.trim(), selectedCapabilities);
      }
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err?.message || 'An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingRole || isPreset) return;

    if (assignedPeopleCount > 0) {
      setErrorMessage(`Cannot delete "${existingRole.name}" while ${assignedPeopleCount} person(s) are assigned to it. Reassign them first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete the "${existingRole.name}" access level?`)) {
      const res = await deleteRole(existingRole.id);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to delete access level.');
      } else {
        onSuccess();
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={
          existingRole 
            ? (isOwner ? existingRole.name : `Edit: ${existingRole.name}`) 
            : "Create Access Level"
        }
        subtitle="Specify a title and toggle what capabilities belong to this access level."
        onBack={onBack}
        action={
          existingRole && !isPreset ? (
            <Button variant="danger" size="md" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" /> Delete Access Level
            </Button>
          ) : undefined
        }
      />

      <form onSubmit={handleSave} className="flex flex-col gap-8">
        {errorMessage && <Alert type="error" message={errorMessage} />}

        {/* Owner Info Banner */}
        {isOwner && (
          <div className="p-6 rounded-3xl bg-zinc-900 text-white flex items-start gap-4 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="h-5 w-5 text-zinc-300" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Full Administrative Control</h4>
              <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                The Owner access level retains full control over the workspace, including creating roles, inviting people, managing tools, and editing business settings. It cannot be altered or removed.
              </p>
            </div>
          </div>
        )}

        {/* Step 1: Title & Purpose */}
        <Card className="flex flex-col gap-6 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center font-bold">1</span>
            What is this access level called?
          </h3>

          <Input
            label="Access Level Title"
            placeholder="e.g. Floor Supervisor, Store Manager, Shift Lead"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            disabled={isOwner || isSaving}
            autoFocus={!existingRole}
          />

          <Input
            label="Description"
            placeholder="e.g. Responsible for daily store operations and team oversight."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isOwner || isSaving}
          />
        </Card>

        {/* Step 2: Capabilities (Dynamically rendered from DB) */}
        <Card className="flex flex-col gap-6 p-6 sm:p-8">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
              <span className="h-6 w-6 rounded-full bg-zinc-900 text-white text-xs flex items-center justify-center font-bold">2</span>
              What can someone at this level do?
            </h3>
            <p className="text-sm text-zinc-500 mt-2">
              Toggle specific capabilities on or off. Changes apply immediately to all assigned team members.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {capabilities.map((capability) => {
              const isSelected = isOwner || selectedCapabilities.includes(capability.id);
              return (
                <CapabilityCard
                  key={capability.id}
                  capability={capability}
                  isSelected={isSelected}
                  onToggle={() => toggleCapability(capability.id)}
                  disabled={isOwner || isSaving}
                />
              );
            })}
          </div>
        </Card>

        {/* Action Buttons */}
        {!isOwner && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="ghost" 
              size="lg" 
              onClick={onBack}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="lg" 
              className="px-8"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {existingRole ? 'Save Changes' : 'Create Access Level'}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
