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
  address?: string;
  city?: string;
  contactEmail?: string;
  contactPhone?: string;
  currency?: string;
}

export interface UserSession {
  userId: string;
  fullName: string;
  emailOrPhone: string;
  avatarUrl?: string;
}

export type ActivityEventType =
  | 'business_created'
  | 'person_invited'
  | 'person_joined'
  | 'role_created'
  | 'role_assigned'
  | 'settings_updated'
  | 'generic';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  title: string;       // Human-readable sentence: "Priya was invited to the team."
  timestamp: string;   // ISO 8601 string
}

// ─── Workspace App Registry ──────────────────────────────────────────────────
// Internally called "App". In the UI, users see "Workspace" / "tools".
// Never expose the word "module" to the user.

export type AppStatus = 'installed' | 'coming_soon';

export interface WorkspaceApp {
  id: string;               // Unique stable id
  slug: string;             // URL/code safe key: 'inventory', 'team', 'orders'
  name: string;             // Display name shown to user
  description: string;      // One sentence. What does this tool help the business do?
  iconKey: string;          // Lucide icon name key — resolved in UI layer
  status: AppStatus;
  installed: boolean;
  installedAt?: string;     // ISO 8601
  navTarget?: string;       // Which WorkspaceTab to open on "Open" — future dynamic sidebar uses this
  showInSidebar?: boolean;  // Future: sidebar renders dynamically from installed apps with this = true
}
