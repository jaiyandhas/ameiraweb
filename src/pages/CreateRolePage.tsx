import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CapabilityCard } from '../components/ui/CapabilityCard';
import { CAPABILITY_DEFINITIONS } from '../types';
import type { CapabilityId } from '../types';
import { Trash2 } from 'lucide-react';

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
  const { createRole, updateRole, deleteRole, getRoleById } = useWorkspace();
  const existingRole = roleId ? getRoleById(roleId) : undefined;

  const [name, setName] = useState(existingRole?.name || '');
  const [description, setDescription] = useState(existingRole?.description || '');
  const [selectedCapabilities, setSelectedCapabilities] = useState<CapabilityId[]>(
    existingRole?.capabilities || []
  );
  const [error, setError] = useState('');

  const isPreset = existingRole?.isPreset;

  const toggleCapability = (id: CapabilityId) => {
    if (isPreset) return;
    setSelectedCapabilities(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a role title');
      return;
    }

    if (existingRole) {
      updateRole(existingRole.id, name.trim(), description.trim(), selectedCapabilities);
    } else {
      createRole(name.trim(), description.trim(), selectedCapabilities);
    }
    onSuccess();
  };

  const handleDelete = () => {
    if (existingRole && !isPreset) {
      if (window.confirm(`Are you sure you want to delete the role "${existingRole.name}"?`)) {
        deleteRole(existingRole.id);
        onSuccess();
      }
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={existingRole ? (isPreset ? existingRole.name : `Edit Role: ${existingRole.name}`) : "Create New Role"}
        subtitle="Specify a title and toggle what capabilities belong to this job role."
        onBack={onBack}
        action={
          existingRole && !isPreset && (
            <Button variant="danger" size="md" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" /> Delete Role
            </Button>
          )
        }
      />

      <form onSubmit={handleSave} className="flex flex-col gap-8">
        {/* Role Name & Description */}
        <Card className="flex flex-col gap-6">
          <h3 className="text-lg font-bold text-zinc-900 border-b border-zinc-100 pb-3">
            1. Role Title & Purpose
          </h3>

          <Input
            label="Role Title"
            placeholder="e.g. Inventory Assistant, Supervisor"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            error={error}
            disabled={isPreset}
          />

          <Input
            label="Role Description"
            placeholder="e.g. Responsible for stocking products and basic customer assistance."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPreset}
          />
        </Card>

        {/* Capability Selection Cards */}
        <Card className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">
              2. Access Capabilities
            </h3>
            <p className="text-sm text-zinc-500 mt-1">
              Click cards to enable or disable specific capabilities for this role.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {CAPABILITY_DEFINITIONS.map((capability) => {
              const isSelected = selectedCapabilities.includes(capability.id);
              return (
                <CapabilityCard
                  key={capability.id}
                  capability={capability}
                  isSelected={isSelected}
                  onToggle={() => toggleCapability(capability.id)}
                  disabled={isPreset}
                />
              );
            })}
          </div>
        </Card>

        {!isPreset && (
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" size="lg" onClick={onBack}>
              Cancel
            </Button>
            <Button type="submit" size="lg" className="px-8">
              {existingRole ? 'Save Role Changes' : 'Create Role'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
