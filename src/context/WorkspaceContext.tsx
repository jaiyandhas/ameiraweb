import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  UserSession, 
  Business, 
  Person, 
  Role, 
  CapabilityId,
  CapabilityDefinition,
  ActivityEvent,
  ActivityEventType,
  WorkspaceApp
} from '../types';
import { CAPABILITY_DEFINITIONS } from '../types';
import { APP_REGISTRY } from '../features/apps/registry';
import { supabase } from '../lib/supabase';
import { 
  apiUpdatePersonRole, 
  apiRemovePerson, 
  apiCreateRole, 
  apiUpdateRole, 
  apiDeleteRole 
} from '../lib/api';

export type BusinessCheckStatus = 'loading' | 'found' | 'not_found';

interface WorkspaceContextType {
  user: UserSession | null;
  business: Business | null;
  people: Person[];
  roles: Role[];
  capabilities: CapabilityDefinition[];
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
  updatePersonRole: (personId: string, roleId: string) => Promise<{ success: boolean; error?: string }>;
  removePerson: (personId: string) => Promise<{ success: boolean; error?: string }>;
  createRole: (name: string, description: string, capabilities: CapabilityId[]) => Promise<string>;
  updateRole: (roleId: string, name: string, description: string, capabilities: CapabilityId[]) => Promise<{ success: boolean; error?: string }>;
  deleteRole: (roleId: string) => Promise<{ success: boolean; error?: string }>;
  updateBusiness: (updates: Partial<Business>) => Promise<void>;
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
  const [capabilities, setCapabilities] = useState<CapabilityDefinition[]>(CAPABILITY_DEFINITIONS);
  const [activeStep, setActiveStep] = useState<'landing' | 'login' | 'verify' | 'create-business' | 'workspace'>('landing');
  const [businessStatus, setBusinessStatus] = useState<BusinessCheckStatus>('loading');
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [apps, setApps] = useState<WorkspaceApp[]>(APP_REGISTRY);

  // Helper to load business data for a user
  const loadBusinessData = useCallback(async (userId: string, userEmail: string, userFullName: string) => {
    setBusinessStatus('loading');
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
          address: bizData.address || undefined,
          city: bizData.city || undefined,
          contactEmail: bizData.contact_email || undefined,
          contactPhone: bizData.contact_phone || undefined,
          currency: bizData.currency || 'INR (₹)',
        });
      }

      // 3. Fetch Capabilities dynamically from database
      const { data: capData } = await supabase
        .from('capabilities')
        .select('*');

      if (capData && capData.length > 0) {
        setCapabilities(capData.map(c => ({
          id: c.key as CapabilityId,
          title: c.name || c.title || c.key,
          description: c.description || '',
          category: (c.app_slug === 'team' ? 'People' : c.app_slug === 'settings' ? 'Settings' : 'Roles') as any,
        })));
      }

      const capIdToKeyMap = new Map<string, CapabilityId>();
      (capData || []).forEach(c => capIdToKeyMap.set(c.id, c.key as CapabilityId));

      // 4. Fetch People for this business
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

      // 5. Fetch Roles (Preset global roles + Business specific roles)
      const { data: rolesData } = await supabase
        .from('roles')
        .select('*')
        .or(`business_id.eq.${businessId},business_id.is.null`)
        .order('created_at', { ascending: true });

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
          capabilities: roleCapsMap.get(r.id) || (r.name === 'Owner' ? ['canManagePeople', 'canManageRoles', 'canViewBusinessSettings', 'canEditBusinessSettings'] : []),
        })));
      }

      // 6. Fetch Installed Apps for this business
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

      // 7. Fetch Activity Events
      const { data: activityData } = await supabase
        .from('activity_events')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
        .limit(30);

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
      } else {
        setBusinessStatus('not_found');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setBusinessStatus('loading');
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

      // 6. Update local workspace context state
      const createdBiz: Business = {
        id: newBizId,
        name: businessName,
        ownerId: currentUserId,
        createdAt: createdAtStr.split('T')[0],
        currency: 'INR (₹)',
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
      const fallbackBiz: Business = {
        id: 'biz-' + Date.now(),
        name: businessName,
        ownerId: user?.userId || 'user-owner',
        createdAt: new Date().toISOString().split('T')[0],
        currency: 'INR (₹)',
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

    const roleName = roles.find(r => r.id === roleId)?.name || 'Access Level';
    await addActivity('person_invited', `${fullName} was invited as ${roleName}.`);
  };

  const updatePersonRole = async (personId: string, roleId: string): Promise<{ success: boolean; error?: string }> => {
    if (!business) return { success: false, error: 'No active workspace.' };
    
    // 1. Call FastAPI enforcement layer
    const apiRes = await apiUpdatePersonRole(personId, roleId);
    if (apiRes.error && !apiRes.error.includes('Network error')) {
      return { success: false, error: apiRes.error };
    }

    // 2. Direct Supabase update fallback
    const targetPerson = people.find(p => p.id === personId);
    if (!targetPerson) return { success: false, error: 'Person not found.' };

    const currentRole = roles.find(r => r.id === targetPerson.roleId);
    const newRole = roles.find(r => r.id === roleId);

    // Sole-Owner safeguard
    if ((currentRole?.name === 'Owner' || targetPerson.roleId === 'role-owner') && newRole?.name !== 'Owner') {
      const activeOwners = people.filter(p => {
        const r = roles.find(role => role.id === p.roleId);
        return (r?.name === 'Owner' || p.roleId === 'role-owner') && p.status === 'active';
      });

      if (activeOwners.length <= 1) {
        return { 
          success: false, 
          error: 'Cannot change the access level of the only active Owner. Designate another Owner first.' 
        };
      }
    }

    const { error } = await supabase
      .from('people')
      .update({ role_id: roleId, updated_at: new Date().toISOString() })
      .eq('id', personId);

    if (error && !apiRes.data) {
      return { success: false, error: error.message };
    }

    setPeople(prev => prev.map(p => p.id === personId ? { ...p, roleId } : p));
    const roleName = newRole?.name || 'Access Level';
    await addActivity('role_assigned', `${targetPerson.fullName}'s access level was changed to ${roleName}.`);
    return { success: true };
  };

  const removePerson = async (personId: string): Promise<{ success: boolean; error?: string }> => {
    if (!business) return { success: false, error: 'No active workspace.' };
    
    // 1. Call FastAPI enforcement layer
    const apiRes = await apiRemovePerson(personId);
    if (apiRes.error && !apiRes.error.includes('Network error')) {
      return { success: false, error: apiRes.error };
    }

    // 2. Direct Supabase deletion fallback
    const targetPerson = people.find(p => p.id === personId);
    if (!targetPerson) return { success: false, error: 'Person not found.' };

    const targetRole = roles.find(r => r.id === targetPerson.roleId);
    if ((targetRole?.name === 'Owner' || targetPerson.roleId === 'role-owner') && targetPerson.status === 'active') {
      const activeOwners = people.filter(p => {
        const r = roles.find(role => role.id === p.roleId);
        return (r?.name === 'Owner' || p.roleId === 'role-owner') && p.status === 'active';
      });

      if (activeOwners.length <= 1) {
        return { 
          success: false, 
          error: 'Cannot remove the sole Owner of the business workspace.' 
        };
      }
    }

    const { error } = await supabase
      .from('people')
      .delete()
      .eq('id', personId);

    if (error && !apiRes.data) {
      return { success: false, error: error.message };
    }

    setPeople(prev => prev.filter(p => p.id !== personId));
    await addActivity('generic', `${targetPerson.fullName} was removed from the business.`);
    return { success: true };
  };

  const createRole = async (name: string, description: string, selectedCapabilities: CapabilityId[]): Promise<string> => {
    if (!business) return '';

    // 1. Call FastAPI enforcement layer
    const apiRes = await apiCreateRole(name, description, selectedCapabilities);
    if (apiRes.data?.id) {
      const createdRole: Role = {
        id: apiRes.data.id,
        name,
        description,
        isPreset: false,
        capabilities: selectedCapabilities,
      };
      setRoles(prev => [...prev, createdRole]);
      await addActivity('role_created', `"${name}" access level was created.`);
      return apiRes.data.id;
    }

    // 2. Direct Supabase insert fallback
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

    const { data: capRows } = await supabase
      .from('capabilities')
      .select('id, key')
      .in('key', selectedCapabilities);

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
      capabilities: selectedCapabilities,
    };

    setRoles(prev => [...prev, createdRole]);
    await addActivity('role_created', `"${name}" access level was created.`);
    return newRole.id;
  };

  const updateRole = async (
    roleId: string, 
    name: string, 
    description: string, 
    selectedCapabilities: CapabilityId[]
  ): Promise<{ success: boolean; error?: string }> => {
    if (!business) return { success: false, error: 'No active workspace.' };

    // 1. Call FastAPI enforcement layer
    const apiRes = await apiUpdateRole(roleId, name, description, selectedCapabilities);
    if (apiRes.error && !apiRes.error.includes('Network error')) {
      return { success: false, error: apiRes.error };
    }

    // 2. Direct Supabase update fallback
    const targetRole = roles.find(r => r.id === roleId);
    if (targetRole?.isPreset || targetRole?.name === 'Owner') {
      return { success: false, error: 'System presets cannot be modified.' };
    }

    const { error } = await supabase
      .from('roles')
      .update({ name, description, updated_at: new Date().toISOString() })
      .eq('id', roleId);

    if (error && !apiRes.data) {
      return { success: false, error: error.message };
    }

    await supabase.from('role_capabilities').delete().eq('role_id', roleId);
    
    const { data: capRows } = await supabase
      .from('capabilities')
      .select('id, key')
      .in('key', selectedCapabilities);

    if (capRows && capRows.length > 0) {
      await supabase
        .from('role_capabilities')
        .insert(capRows.map(c => ({
          role_id: roleId,
          capability_id: c.id,
        })));
    }

    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, name, description, capabilities: selectedCapabilities } : r));
    await addActivity('generic', `"${name}" access level details were updated.`);
    return { success: true };
  };

  const deleteRole = async (roleId: string): Promise<{ success: boolean; error?: string }> => {
    if (!business) return { success: false, error: 'No active workspace.' };
    
    // 1. Call FastAPI enforcement layer
    const apiRes = await apiDeleteRole(roleId);
    if (apiRes.error && !apiRes.error.includes('Network error')) {
      return { success: false, error: apiRes.error };
    }

    // 2. Direct Supabase deletion fallback
    const targetRole = roles.find(r => r.id === roleId);
    if (!targetRole) return { success: false, error: 'Access level not found.' };

    if (targetRole.isPreset || targetRole.name === 'Owner') {
      return { success: false, error: 'System preset access levels cannot be deleted.' };
    }

    const assignedCount = people.filter(p => p.roleId === roleId).length;
    if (assignedCount > 0) {
      return { 
        success: false, 
        error: `Cannot delete "${targetRole.name}" because ${assignedCount} team member(s) are assigned to it. Reassign them first.` 
      };
    }

    const { error } = await supabase.from('roles').delete().eq('id', roleId);
    if (error && !apiRes.data) {
      return { success: false, error: error.message };
    }

    setRoles(prev => prev.filter(r => r.id !== roleId));
    await addActivity('generic', `"${targetRole.name}" access level was deleted.`);
    return { success: true };
  };

  const updateBusiness = async (updates: Partial<Business>) => {
    if (!business) return;

    const dbPayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) dbPayload.name = updates.name;
    if (updates.address !== undefined) dbPayload.address = updates.address;
    if (updates.city !== undefined) dbPayload.city = updates.city;
    if (updates.contactEmail !== undefined) dbPayload.contact_email = updates.contactEmail;
    if (updates.contactPhone !== undefined) dbPayload.contact_phone = updates.contactPhone;
    if (updates.currency !== undefined) dbPayload.currency = updates.currency;

    const { error } = await supabase
      .from('businesses')
      .update(dbPayload)
      .eq('id', business.id);

    if (!error) {
      const updated: Business = { ...business, ...updates };
      setBusiness(updated);
      localStorage.setItem('ameira_business', JSON.stringify(updated));
      await addActivity('settings_updated', `Business details were updated.`);
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
    localStorage.removeItem('ameira_business');
    localStorage.removeItem('ameira_user');
    setUser(null);
    setBusiness(null);
    setPeople([]);
    setActivities([]);
    setBusinessStatus('not_found');
    setActiveStep('landing');
  };

  const hasCapability = (capability: CapabilityId): boolean => {
    if (!user || !people.length) return false;
    const currentPerson = people.find(p => p.emailOrPhone === user.emailOrPhone || p.fullName === user.fullName);
    if (!currentPerson) return false;
    const userRole = roles.find(r => r.id === currentPerson.roleId);
    if (!userRole) return false;
    if (userRole.isPreset && userRole.name === 'Owner') return true;
    return userRole.capabilities.includes(capability);
  };

  const getRoleById = (roleId: string): Role | undefined => {
    return roles.find(r => r.id === roleId);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        user,
        business,
        people,
        roles,
        capabilities,
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
        getRoleById,
      }}
    >
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
