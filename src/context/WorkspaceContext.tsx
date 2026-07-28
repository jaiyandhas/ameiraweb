import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  UserSession, 
  Business, 
  Person, 
  Role, 
  CapabilityId,
  ActivityEvent,
  ActivityEventType
} from '../types';

interface WorkspaceContextType {
  user: UserSession | null;
  business: Business | null;
  people: Person[];
  roles: Role[];
  activities: ActivityEvent[];
  activeStep: 'landing' | 'login' | 'verify' | 'create-business' | 'workspace';
  authInitialMode: 'login' | 'register';
  pendingContact: string;

  // Actions
  openAuth: () => void;
  openRegister: () => void;
  goBackToLanding: () => void;
  setPendingContact: (contact: string) => void;
  loginWithContact: (contact: string) => void;
  verifyOtp: (code: string) => boolean;
  createBusiness: (businessName: string) => void;
  invitePerson: (fullName: string, emailOrPhone: string, roleId: string) => void;
  updatePersonRole: (personId: string, roleId: string) => void;
  removePerson: (personId: string) => void;
  createRole: (name: string, description: string, capabilities: CapabilityId[]) => string;
  updateRole: (roleId: string, name: string, description: string, capabilities: CapabilityId[]) => void;
  deleteRole: (roleId: string) => void;
  updateBusiness: (name: string) => void;
  logout: () => void;
  hasCapability: (capability: CapabilityId) => boolean;
  getRoleById: (roleId: string) => Role | undefined;
}

const PRESET_ROLES: Role[] = [
  {
    id: 'role-owner',
    name: 'Owner',
    description: 'Full control over the business, people, roles, and settings.',
    isPreset: true,
    capabilities: ['canManagePeople', 'canManageRoles', 'canViewBusinessSettings', 'canEditBusinessSettings']
  },
  {
    id: 'role-manager',
    name: 'Manager',
    description: 'Can manage people and view business settings. Cannot edit roles or business settings.',
    isPreset: true,
    capabilities: ['canManagePeople', 'canViewBusinessSettings']
  },
  {
    id: 'role-staff',
    name: 'Staff',
    description: 'Standard team access. Cannot access people management, roles, or settings.',
    isPreset: true,
    capabilities: []
  }
];

const INITIAL_PEOPLE: Person[] = [
  {
    id: 'person-owner',
    fullName: 'Ramesh Patel',
    emailOrPhone: 'ramesh@pateltraders.com',
    roleId: 'role-owner',
    status: 'active',
    joinedAt: '2026-01-15'
  },
  {
    id: 'person-2',
    fullName: 'Priya Sharma',
    emailOrPhone: '+91 98765 43210',
    roleId: 'role-manager',
    status: 'active',
    joinedAt: '2026-02-01'
  },
  {
    id: 'person-3',
    fullName: 'Vikram Singh',
    emailOrPhone: 'vikram@pateltraders.com',
    roleId: 'role-staff',
    status: 'invited',
    joinedAt: '2026-07-20'
  }
];

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [pendingContact, setPendingContact] = useState<string>('');
  const [business, setBusiness] = useState<Business | null>(null);
  const [people, setPeople] = useState<Person[]>(INITIAL_PEOPLE);
  const [roles, setRoles] = useState<Role[]>(PRESET_ROLES);
  const [activeStep, setActiveStep] = useState<'landing' | 'login' | 'verify' | 'create-business' | 'workspace'>('landing');
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [activities, setActivities] = useState<ActivityEvent[]>([]);

  const addActivity = (type: ActivityEventType, title: string) => {
    const event: ActivityEvent = {
      id: 'evt-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      type,
      title,
      timestamp: new Date().toISOString(),
    };
    setActivities(prev => [event, ...prev]);
  };

  // Load persistent session if present
  useEffect(() => {
    const savedUser = localStorage.getItem('ameira_user');
    const savedBusiness = localStorage.getItem('ameira_business');
    if (savedUser && savedBusiness) {
      setUser(JSON.parse(savedUser));
      setBusiness(JSON.parse(savedBusiness));
      setActiveStep('workspace');
    }
  }, []);

  const openAuth = () => {
    setAuthInitialMode('login');
    setActiveStep('login');
  };

  const openRegister = () => {
    setAuthInitialMode('register');
    setActiveStep('login');
  };

  const goBackToLanding = () => {
    setAuthInitialMode('login');
    setActiveStep('landing');
  };

  const loginWithContact = (contact: string) => {
    if (!contact || !contact.trim()) {
      setActiveStep('login');
      return;
    }
    setPendingContact(contact);
    const newUser: UserSession = {
      userId: 'user-' + Date.now(),
      fullName: contact.includes('@') ? contact.split('@')[0] : 'Business Owner',
      emailOrPhone: contact,
    };
    setUser(newUser);
    localStorage.setItem('ameira_user', JSON.stringify(newUser));

    if (business) {
      setActiveStep('workspace');
    } else {
      setActiveStep('create-business');
    }
  };

  const verifyOtp = (code: string): boolean => {
    if (code.length === 6) {
      const newUser: UserSession = {
        userId: 'user-' + Date.now(),
        fullName: pendingContact.includes('@') ? pendingContact.split('@')[0] : 'Business Owner',
        emailOrPhone: pendingContact,
      };
      setUser(newUser);
      localStorage.setItem('ameira_user', JSON.stringify(newUser));

      if (business) {
        setActiveStep('workspace');
      } else {
        setActiveStep('create-business');
      }
      return true;
    }
    return false;
  };

  const createBusiness = (businessName: string) => {
    if (!user) return;
    const now = new Date().toISOString();
    const newBusiness: Business = {
      id: 'biz-' + Date.now(),
      name: businessName,
      ownerId: user.userId,
      createdAt: now.split('T')[0],
    };
    setBusiness(newBusiness);
    localStorage.setItem('ameira_business', JSON.stringify(newBusiness));

    // Update people list with owner
    const ownerPerson: Person = {
      id: 'person-' + user.userId,
      fullName: user.fullName,
      emailOrPhone: user.emailOrPhone,
      roleId: 'role-owner',
      status: 'active',
      joinedAt: now.split('T')[0],
    };
    setPeople([ownerPerson, ...INITIAL_PEOPLE.slice(1)]);

    // Seed initial activity events
    const seedEvents: ActivityEvent[] = [
      {
        id: 'evt-seed-1',
        type: 'business_created',
        title: `${businessName} workspace was created.`,
        timestamp: now,
      },
      {
        id: 'evt-seed-2',
        type: 'person_invited',
        title: 'Priya Sharma was invited as Manager.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: 'evt-seed-3',
        type: 'person_invited',
        title: 'Vikram Singh was invited as Staff.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      },
    ];
    setActivities(seedEvents);
    setActiveStep('workspace');
  };

  const invitePerson = (fullName: string, emailOrPhone: string, roleId: string) => {
    const newPerson: Person = {
      id: 'person-' + Date.now(),
      fullName,
      emailOrPhone,
      roleId,
      status: 'invited',
      joinedAt: new Date().toISOString().split('T')[0],
    };
    setPeople(prev => [newPerson, ...prev]);
    const roleName = roles.find(r => r.id === roleId)?.name || 'team member';
    addActivity('person_invited', `${fullName} was invited as ${roleName}.`);
  };

  const updatePersonRole = (personId: string, roleId: string) => {
    setPeople(prev => prev.map(p => p.id === personId ? { ...p, roleId } : p));
  };

  const removePerson = (personId: string) => {
    setPeople(prev => prev.filter(p => p.id !== personId));
  };

  const createRole = (name: string, description: string, capabilities: CapabilityId[]): string => {
    const newRoleId = 'role-custom-' + Date.now();
    const newRole: Role = {
      id: newRoleId,
      name,
      description,
      isPreset: false,
      capabilities
    };
    setRoles(prev => [...prev, newRole]);
    addActivity('role_created', `"${name}" role was created.`);
    return newRoleId;
  };

  const updateRole = (roleId: string, name: string, description: string, capabilities: CapabilityId[]) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, name, description, capabilities } : r));
  };

  const deleteRole = (roleId: string) => {
    // Reassign anyone with this role to Staff
    setPeople(prev => prev.map(p => p.roleId === roleId ? { ...p, roleId: 'role-staff' } : p));
    setRoles(prev => prev.filter(r => r.id !== roleId));
  };

  const updateBusiness = (name: string) => {
    if (!business) return;
    const updated = { ...business, name };
    setBusiness(updated);
    localStorage.setItem('ameira_business', JSON.stringify(updated));
    addActivity('settings_updated', `Business name updated to "${name}".`);
  };

  const logout = () => {
    setUser(null);
    setBusiness(null);
    localStorage.removeItem('ameira_user');
    localStorage.removeItem('ameira_business');
    setActiveStep('landing');
  };

  const getRoleById = (roleId: string) => {
    return roles.find(r => r.id === roleId);
  };

  const hasCapability = (capability: CapabilityId): boolean => {
    if (!user || !people.length) return false;
    // Find current user in people
    const currentPerson = people.find(p => p.emailOrPhone === user.emailOrPhone) || people[0];
    const role = getRoleById(currentPerson.roleId);
    if (!role) return false;
    return role.capabilities.includes(capability);
  };

  return (
    <WorkspaceContext.Provider value={{
      user,
      business,
      people,
      roles,
      activities,
      activeStep,
      authInitialMode,
      pendingContact,
      openAuth,
      openRegister,
      goBackToLanding,
      setPendingContact,
      loginWithContact,
      verifyOtp,
      createBusiness,
      invitePerson,
      updatePersonRole,
      removePerson,
      createRole,
      updateRole,
      deleteRole,
      updateBusiness,
      logout,
      hasCapability,
      getRoleById
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
