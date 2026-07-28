export type CapabilityId = 
  | 'canManagePeople'
  | 'canManageRoles'
  | 'canViewBusinessSettings'
  | 'canEditBusinessSettings';

export interface CapabilityDefinition {
  id: CapabilityId;
  title: string;
  description: string;
  category: 'People' | 'Roles' | 'Settings';
}

export const CAPABILITY_DEFINITIONS: CapabilityDefinition[] = [
  {
    id: 'canManagePeople',
    title: 'Invite & Manage People',
    description: 'Can add new team members, edit member details, change assigned roles, or remove people from the business.',
    category: 'People'
  },
  {
    id: 'canManageRoles',
    title: 'Create & Edit Roles',
    description: 'Can define custom job roles and configure what capabilities each role possesses.',
    category: 'Roles'
  },
  {
    id: 'canViewBusinessSettings',
    title: 'View Business Profile',
    description: 'Can see official business contact details and owner identity.',
    category: 'Settings'
  },
  {
    id: 'canEditBusinessSettings',
    title: 'Update Business Profile',
    description: 'Can modify the business name, logo, address, and primary contact details.',
    category: 'Settings'
  }
];

export interface Role {
  id: string;
  name: string;
  description: string;
  isPreset: boolean; // Owner, Manager, Staff are default system presets
  capabilities: CapabilityId[];
}

export interface Person {
  id: string;
  fullName: string;
  emailOrPhone: string;
  roleId: string;
  status: 'active' | 'invited' | 'disabled';
  joinedAt: string;
  avatarUrl?: string;
}

export interface Business {
  id: string;
  name: string;
  logoUrl?: string;
  ownerId: string;
  createdAt: string;
}

export interface UserSession {
  userId: string;
  fullName: string;
  emailOrPhone: string;
  avatarUrl?: string;
}
