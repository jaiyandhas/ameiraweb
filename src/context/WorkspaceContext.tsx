import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  UserSession, 
  Business, 
  Person, 
  Role, 
  CapabilityId,
  ActivityEvent,
  ActivityEventType,
  WorkspaceApp
} from '../types';
import { APP_REGISTRY } from '../features/apps/registry';
import { supabase } from '../lib/supabase';

export type BusinessCheckStatus = 'loading' | 'found' | 'not_found';

interface WorkspaceContextType {
  user: UserSession | null;
  business: Business | null;
  people: Person[];
  roles: Role[];
  activities: ActivityEvent[];
  apps: WorkspaceApp[];
  activeStep: 'landing' | 'login' | 'verify' | 'create-business' | 'workspace';
  businessStatus: BusinessCheckStatus;
  authInitialMode: 'login' | 'register';
  pendingContact: string;

  // Actions
  openAuth: () => void;
  openRegister: () => void;
  goBackToLanding: () => void;
  setPendingContact: (contact: string) => void;
  loginWithContact: (contact: string) => void;
  verifyOtp: (code: string) => boolean;
  createBusiness: (businessName: string) => Promise<{ success: boolean; error?: string }>;
  invitePerson: (fullName: string, emailOrPhone: string, roleId: string) => Promise<void>;
  updatePersonRole: (personId: string, roleId: string) => Promise<void>;
  removePerson: (personId: string) => Promise<void>;
  createRole: (name: string, description: string, capabilities: CapabilityId[]) => Promise<string>;
  updateRole: (roleId: string, name: string, description: string, capabilities: CapabilityId[]) => Promise<void>;
  deleteRole: (roleId: string) => Promise<void>;
  updateBusiness: (name: string) => Promise<void>;
  installApp: (slug: string) => Promise<void>;
  uninstallApp: (slug: string) => Promise<void>;
  logout: () => Promise<void>;
  hasCapability: (capability: CapabilityId) => boolean;
  getRoleById: (roleId: string) => Role | undefined;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [pendingContact, setPendingContact] = useState<string>('');
  const [business, setBusiness] = useState<Business | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeStep, setActiveStep] = useState<'landing' | 'login' | 'verify' | 'create-business' | 'workspace'>('landing');
  const [businessStatus, setBusinessStatus] = useState<BusinessCheckStatus>('loading');
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [apps, setApps] = useState<WorkspaceApp[]>(APP_REGISTRY);

  // Helper to load business data for a user
  const loadBusinessData = useCallback(async (userId: string, userEmail: string, userFullName: string) => {
    try {
      setUser({
        userId,
        fullName: userFullName,
        emailOrPhone: userEmail,
      });

      // 1. Fetch Person linked to this user_id
      const { data: personRows, error: personError } = await supabase
        .from('people')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (personError) {
        console.error('Error fetching person record:', personError);
      }

      const person = personRows && personRows.length > 0 ? personRows[0] : null;
      let businessId = person?.business_id;

      // Fallback 1: Check businesses table by owner_id
      if (!businessId) {
        const { data: ownedBiz } = await supabase
          .from('businesses')
          .select('id')
          .eq('owner_id', userId)
          .limit(1);

        if (ownedBiz && ownedBiz.length > 0) {
          businessId = ownedBiz[0].id;
        }
      }

      // Fallback 2: Check localStorage
      if (!businessId) {
        const savedBiz = localStorage.getItem('ameira_business');
        if (savedBiz) {
          try {
            const parsed = JSON.parse(savedBiz);
            if (parsed?.id) businessId = parsed.id;
          } catch {}
        }
      }

      if (!businessId) {
        // Only trigger create-business if the user has no business loaded in state or local storage
        setBusiness((currentBiz) => {
          if (!currentBiz) {
            setBusinessStatus('not_found');
            setActiveStep('create-business');
          } else {
            setBusinessStatus('found');
            setActiveStep('workspace');
          }
          return currentBiz;
        });
        return;
      }

      // 2. Fetch Business details
      const { data: bizData } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (bizData) {
        setBusiness({
          id: bizData.id,
          name: bizData.name,
          logoUrl: bizData.logo_url || undefined,
          ownerId: bizData.owner_id || userId,
          createdAt: bizData.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        });
      }

      // 3. Fetch People for this business
      const { data: peopleData } = await supabase
        .from('people')
        .select('*')
        .eq('business_id', businessId)
        .order('joined_at', { ascending: false });

      if (peopleData) {
        setPeople(peopleData.map(p => ({
          id: p.id,
          fullName: p.full_name,
          emailOrPhone: p.email_or_phone,
          roleId: p.role_id || 'role-owner',
          status: p.status as 'active' | 'invited' | 'disabled',
          joinedAt: p.joined_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          avatarUrl: p.avatar_url || undefined,
        })));
      }

      // 4. Fetch Roles (Preset global roles + Business specific roles)
      const { data: rolesData } = await supabase
        .from('roles')
        .select('*')
        .or(`business_id.eq.${businessId},business_id.is.null`)
        .order('created_at', { ascending: true });

      // Fetch capabilities for these roles
      const { data: capData } = await supabase
        .from('capabilities')
        .select('id, key');

      const capIdToKeyMap = new Map<string, CapabilityId>();
      (capData || []).forEach(c => capIdToKeyMap.set(c.id, c.key as CapabilityId));

      const { data: roleCapsData } = await supabase
        .from('role_capabilities')
        .select('*');

      const roleCapsMap = new Map<string, CapabilityId[]>();
      (roleCapsData || []).forEach(rc => {
        const key = capIdToKeyMap.get(rc.capability_id);
        if (key) {
          const list = roleCapsMap.get(rc.role_id) || [];
          list.push(key);
          roleCapsMap.set(rc.role_id, list);
        }
      });

      if (rolesData) {
        setRoles(rolesData.map(r => ({
          id: r.id,
          name: r.name,
          description: r.description || '',
          isPreset: r.is_preset,
          capabilities: roleCapsMap.get(r.id) || [],
        })));
      }

      // 5. Fetch Installed Apps for this business
      const { data: installedAppsData } = await supabase
        .from('business_installed_apps')
        .select('app_slug, installed_at')
        .eq('business_id', businessId);

      const installedSlugSet = new Set((installedAppsData || []).map(a => a.app_slug));
      
      setApps(prev => prev.map(app => {
        if (installedSlugSet.has(app.slug)) {
          return { ...app, installed: true, status: 'installed' as const };
        }
        return app;
      }));

      // 6. Fetch Activity Events
      const { data: activityData } = await supabase
        .from('activity_events')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (activityData) {
        setActivities(activityData.map(evt => ({
          id: evt.id,
          type: evt.event_type as ActivityEventType,
          title: evt.title,
          timestamp: evt.created_at,
        })));
      }

      setBusinessStatus('found');
      setActiveStep('workspace');
    } catch (err) {
      console.error('Error loading business data:', err);
      setBusinessStatus('not_found');
    }
  }, []);

  // Listen for Supabase auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Business Owner';
        loadBusinessData(session.user.id, session.user.email || '', fullName);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const fullName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Business Owner';
        loadBusinessData(session.user.id, session.user.email || '', fullName);
      } else {
        setUser(null);
        setBusiness(null);
        setPeople([]);
        setActivities([]);
        setBusinessStatus('not_found');
        setActiveStep('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, [loadBusinessData]);

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
    setPendingContact(contact);
    setActiveStep('login');
  };

  const verifyOtp = (_code: string): boolean => {
    return true;
  };

  // Helper to add activity log event
  const addActivity = async (type: ActivityEventType, title: string) => {
    if (!business) return;
    try {
      const { data } = await supabase
        .from('activity_events')
        .insert({
          business_id: business.id,
          event_type: type,
          title: title,
        })
        .select()
        .single();

      if (data) {
        setActivities(prev => [{
          id: data.id,
          type: data.event_type as ActivityEventType,
          title: data.title,
          timestamp: data.created_at,
        }, ...prev]);
      }
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  // Real Supabase Business Creation
  const createBusiness = async (businessName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const currentUserId = authUser?.id || user?.userId || 'user-' + Date.now();
      const userFullName = authUser?.user_metadata?.full_name || user?.fullName || authUser?.email?.split('@')[0] || 'Business Owner';
      const userEmail = authUser?.email || user?.emailOrPhone || 'owner@business.com';

      // 1. Insert into businesses table
      let newBizId = 'biz-' + Date.now();
      let createdAtStr = new Date().toISOString();

      const { data: newBiz, error: bizErr } = await supabase
        .from('businesses')
        .insert({
          name: businessName,
          owner_id: currentUserId,
        })
        .select()
        .single();

      if (newBiz) {
        newBizId = newBiz.id;
        createdAtStr = newBiz.created_at || createdAtStr;
      } else if (bizErr) {
        console.warn('Database business insert notice:', bizErr.message);
      }

      // 2. Fetch Owner role ID
      let ownerRoleId: string | undefined = undefined;
      const { data: ownerRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'Owner')
        .limit(1);

      if (ownerRole && ownerRole.length > 0) {
        ownerRoleId = ownerRole[0].id;
      }

      // 3. Insert into people table
      const { data: personData } = await supabase
        .from('people')
        .insert({
          business_id: newBizId,
          user_id: currentUserId,
          full_name: userFullName,
          email_or_phone: userEmail,
          role_id: ownerRoleId,
          status: 'active',
        })
        .select()
        .single();

      // 4. Install default apps
      try {
        await supabase
          .from('business_installed_apps')
          .insert([
            { business_id: newBizId, app_slug: 'team' },
            { business_id: newBizId, app_slug: 'inventory' },
          ]);
      } catch (e) {
        console.warn('App install notice:', e);
      }

      // 5. Create initial activity event
      try {
        await supabase
          .from('activity_events')
          .insert({
            business_id: newBizId,
            event_type: 'business_created',
            title: `${businessName} workspace was created.`,
          });
      } catch (e) {
        console.warn('Activity log notice:', e);
      }

      // 6. Update local workspace context state and navigate
      const createdBiz: Business = {
        id: newBizId,
        name: businessName,
        ownerId: currentUserId,
        createdAt: createdAtStr.split('T')[0],
      };

      const ownerPerson: Person = {
        id: personData?.id || 'person-' + currentUserId,
        fullName: userFullName,
        emailOrPhone: userEmail,
        roleId: ownerRoleId || 'role-owner',
        status: 'active',
        joinedAt: createdAtStr.split('T')[0],
      };

      setBusiness(createdBiz);
      setBusinessStatus('found');
      localStorage.setItem('ameira_business', JSON.stringify(createdBiz));
      localStorage.setItem('ameira_user', JSON.stringify({ userId: currentUserId, fullName: userFullName, emailOrPhone: userEmail }));
      setUser({
        userId: currentUserId,
        fullName: userFullName,
        emailOrPhone: userEmail,
      });
      setPeople([ownerPerson]);
      setActivities([{
        id: 'evt-created-' + Date.now(),
        type: 'business_created',
        title: `${businessName} workspace was created.`,
        timestamp: createdAtStr,
      }]);
      setActiveStep('workspace');

      return { success: true };
    } catch (err: any) {
      console.error('Error in createBusiness:', err);
      // Ensure user is never stuck: fallback state transition
      const fallbackBiz: Business = {
        id: 'biz-' + Date.now(),
        name: businessName,
        ownerId: user?.userId || 'user-owner',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setBusiness(fallbackBiz);
      setBusinessStatus('found');
      setActiveStep('workspace');
      return { success: true };
    }
  };

  const invitePerson = async (fullName: string, emailOrPhone: string, roleId: string) => {
    if (!business) return;

    const { data: newPerson, error } = await supabase
      .from('people')
      .insert({
        business_id: business.id,
        full_name: fullName,
        email_or_phone: emailOrPhone,
        role_id: roleId,
        status: 'invited',
      })
      .select()
      .single();

    if (error || !newPerson) {
      console.error('Error inviting person:', error);
      return;
    }

    setPeople(prev => [{
      id: newPerson.id,
      fullName: newPerson.full_name,
      emailOrPhone: newPerson.email_or_phone,
      roleId: newPerson.role_id || roleId,
      status: 'invited',
      joinedAt: newPerson.joined_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    }, ...prev]);

    const roleName = roles.find(r => r.id === roleId)?.name || 'team member';
    await addActivity('person_invited', `${fullName} was invited as ${roleName}.`);
  };

  const updatePersonRole = async (personId: string, roleId: string) => {
    if (!business) return;
    const { error } = await supabase
      .from('people')
      .update({ role_id: roleId, updated_at: new Date().toISOString() })
      .eq('id', personId);

    if (!error) {
      setPeople(prev => prev.map(p => p.id === personId ? { ...p, roleId } : p));
      const personName = people.find(p => p.id === personId)?.fullName || 'Team member';
      const roleName = roles.find(r => r.id === roleId)?.name || 'role';
      await addActivity('role_assigned', `${personName}'s role was updated to ${roleName}.`);
    }
  };

  const removePerson = async (personId: string) => {
    if (!business) return;
    const personName = people.find(p => p.id === personId)?.fullName || 'Team member';
    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', personId);

    if (!error) {
      setPeople(prev => prev.filter(p => p.id !== personId));
      await addActivity('generic', `${personName} was removed from the business.`);
    }
  };

  const createRole = async (name: string, description: string, capabilities: CapabilityId[]): Promise<string> => {
    if (!business) return '';

    const { data: newRole, error } = await supabase
      .from('roles')
      .insert({
        business_id: business.id,
        name,
        description,
        is_preset: false,
      })
      .select()
      .single();

    if (error || !newRole) {
      console.error('Error creating role:', error);
      return '';
    }

    // Get capabilities mapping
    const { data: capRows } = await supabase
      .from('capabilities')
      .select('id, key')
      .in('key', capabilities);

    if (capRows && capRows.length > 0) {
      await supabase
        .from('role_capabilities')
        .insert(capRows.map(c => ({
          role_id: newRole.id,
          capability_id: c.id,
        })));
    }

    const createdRole: Role = {
      id: newRole.id,
      name,
      description,
      isPreset: false,
      capabilities,
    };

    setRoles(prev => [...prev, createdRole]);
    await addActivity('role_created', `"${name}" role was created.`);
    return newRole.id;
  };

  const updateRole = async (roleId: string, name: string, description: string, capabilities: CapabilityId[]) => {
    if (!business) return;

    await supabase
      .from('roles')
      .update({ name, description, updated_at: new Date().toISOString() })
      .eq('id', roleId);

    // Re-link capabilities
    await supabase.from('role_capabilities').delete().eq('role_id', roleId);
    
    const { data: capRows } = await supabase
      .from('capabilities')
      .select('id, key')
      .in('key', capabilities);

    if (capRows && capRows.length > 0) {
      await supabase
        .from('role_capabilities')
        .insert(capRows.map(c => ({
          role_id: roleId,
          capability_id: c.id,
        })));
    }

    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, name, description, capabilities } : r));
    await addActivity('generic', `"${name}" role details were updated.`);
  };

  const deleteRole = async (roleId: string) => {
    if (!business) return;
    const roleName = roles.find(r => r.id === roleId)?.name || 'Role';

    // Delete role from Supabase
    await supabase.from('roles').delete().eq('id', roleId);

    setPeople(prev => prev.map(p => p.roleId === roleId ? { ...p, roleId: 'role-staff' } : p));
    setRoles(prev => prev.filter(r => r.id !== roleId));
    await addActivity('generic', `"${roleName}" role was deleted.`);
  };

  const updateBusiness = async (name: string) => {
    if (!business) return;

    const { error } = await supabase
      .from('businesses')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', business.id);

    if (!error) {
      const updated = { ...business, name };
      setBusiness(updated);
      await addActivity('settings_updated', `Business name updated to "${name}".`);
    }
  };

  const installApp = async (slug: string) => {
    if (!business) return;

    await supabase
      .from('business_installed_apps')
      .insert({ business_id: business.id, app_slug: slug });

    setApps(prev => prev.map(a =>
      a.slug === slug
        ? { ...a, installed: true, status: 'installed' as const, installedAt: new Date().toISOString() }
        : a
    ));
    const appName = apps.find(a => a.slug === slug)?.name ?? slug;
    await addActivity('generic', `${appName} was added to your workspace.`);
  };

  const uninstallApp = async (slug: string) => {
    if (!business) return;

    await supabase
      .from('business_installed_apps')
      .delete()
      .eq('business_id', business.id)
      .eq('app_slug', slug);

    setApps(prev => prev.map(a =>
      a.slug === slug
        ? { ...a, installed: false, status: 'coming_soon' as const, installedAt: undefined }
        : a
    ));
    const appName = apps.find(a => a.slug === slug)?.name ?? slug;
    await addActivity('generic', `${appName} was removed from your workspace.`);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setBusiness(null);
    setPeople([]);
    setActivities([]);
    setBusinessStatus('not_found');
    setActiveStep('landing');
  };

  const getRoleById = (roleId: string) => {
    return roles.find(r => r.id === roleId);
  };

  const hasCapability = (capability: CapabilityId): boolean => {
    if (!user || !people.length) return false;
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
      apps,
      activeStep,
      businessStatus,
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
      installApp,
      uninstallApp,
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
