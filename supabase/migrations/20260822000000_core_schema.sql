-- ==============================================================================
-- Ameira Core Database Schema & RLS Policies
-- Migration: 20260822000000_core_schema.sql
-- Description: Establishes Business root, People, Roles, Capability Registry,
--              Workspace Apps Registry, Activity Events log, and RLS policies.
-- ==============================================================================

-- 1. Businesses (Tenant Root)
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  owner_id UUID, -- References auth.users(id)
  address TEXT,
  city TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  currency TEXT NOT NULL DEFAULT 'INR (₹)',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Workspace Apps Registry (Pluggable Module Registry)
CREATE TABLE IF NOT EXISTS public.workspace_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'installed', -- 'installed' | 'coming_soon'
  nav_target TEXT,
  show_in_sidebar BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Capability Registry (Extensible Permissions)
CREATE TABLE IF NOT EXISTS public.capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL, -- e.g., 'canManagePeople', 'canManageRoles'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- 'People' | 'Roles' | 'Settings' | etc.
  app_slug TEXT REFERENCES public.workspace_apps(slug) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Roles ("Access Levels" in Ameira UI)
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE, -- NULL for global default preset roles
  name TEXT NOT NULL,
  description TEXT,
  is_preset BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Role Capabilities Join Table
CREATE TABLE IF NOT EXISTS public.role_capabilities (
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  capability_id UUID NOT NULL REFERENCES public.capabilities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (role_id, capability_id)
);

-- 6. People (Team Members linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email_or_phone TEXT NOT NULL,
  role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'invited' | 'disabled'
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Foreign key back for owner_id in businesses
ALTER TABLE public.businesses
  DROP CONSTRAINT IF EXISTS fk_businesses_owner;

-- Add index on foreign keys for query performance
CREATE INDEX IF NOT EXISTS idx_people_business_id ON public.people(business_id);
CREATE INDEX IF NOT EXISTS idx_people_user_id ON public.people(user_id);
CREATE INDEX IF NOT EXISTS idx_roles_business_id ON public.roles(business_id);
CREATE INDEX IF NOT EXISTS idx_capabilities_app_slug ON public.capabilities(app_slug);

-- 7. Business Installed Apps (Junction for active tools per business)
CREATE TABLE IF NOT EXISTS public.business_installed_apps (
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  app_slug TEXT NOT NULL REFERENCES public.workspace_apps(slug) ON DELETE CASCADE,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (business_id, app_slug)
);

CREATE INDEX IF NOT EXISTS idx_business_installed_apps_biz ON public.business_installed_apps(business_id);

-- 8. Activity Events (Polymorphic Activity Log)
CREATE TABLE IF NOT EXISTS public.activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  actor_person_id UUID REFERENCES public.people(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'business_created' | 'person_invited' | 'role_created' | etc.
  entity_type TEXT,
  entity_id TEXT,
  title TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_events_biz_date ON public.activity_events(business_id, created_at DESC);

-- ==============================================================================
-- Seed Baseline System Registries (Apps & Capabilities & Default Presets)
-- ==============================================================================

-- Seed Workspace Apps
INSERT INTO public.workspace_apps (slug, name, description, icon_key, status, nav_target, show_in_sidebar)
VALUES
  ('team', 'Team', 'Manage your people, invite team members, and control who does what.', 'Users', 'installed', 'people', true),
  ('inventory', 'Inventory', 'Track your products, stock levels, and manage what your business holds.', 'Package', 'installed', 'inventory', true),
  ('orders', 'Orders', 'Track customer orders from request to delivery, all in one place.', 'ShoppingBag', 'coming_soon', null, false),
  ('marketplace', 'Marketplace', 'Connect with trusted suppliers and service providers for your business.', 'Store', 'coming_soon', null, false),
  ('attendance', 'Attendance', 'Track your team''s working hours and daily attendance records.', 'ClipboardList', 'coming_soon', null, false),
  ('assets', 'Assets', 'Keep a record of every machine, vehicle, and physical asset your business owns.', 'Wrench', 'coming_soon', null, false),
  ('production', 'Production', 'Plan and track manufacturing batches, work orders, and output targets.', 'Factory', 'coming_soon', null, false)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_key = EXCLUDED.icon_key,
  status = EXCLUDED.status,
  nav_target = EXCLUDED.nav_target,
  show_in_sidebar = EXCLUDED.show_in_sidebar;

-- Seed Capabilities
INSERT INTO public.capabilities (key, title, description, category, app_slug)
VALUES
  ('canManagePeople', 'Invite & Manage People', 'Can add new team members, edit member details, change assigned roles, or remove people from the business.', 'People', 'team'),
  ('canManageRoles', 'Create & Edit Roles', 'Can define custom job roles and configure what capabilities each role possesses.', 'Roles', 'team'),
  ('canViewBusinessSettings', 'View Business Profile', 'Can see official business contact details and owner identity.', 'Settings', null),
  ('canEditBusinessSettings', 'Update Business Profile', 'Can modify the business name, logo, address, and primary contact details.', 'Settings', null)
ON CONFLICT (key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  app_slug = EXCLUDED.app_slug;

-- Seed Global Preset Roles (Owner, Manager, Staff with NULL business_id)
INSERT INTO public.roles (id, business_id, name, description, is_preset)
VALUES
  ('00000000-0000-0000-0000-000000000001', null, 'Owner', 'Full control over the business, people, roles, and settings.', true),
  ('00000000-0000-0000-0000-000000000002', null, 'Manager', 'Can manage people and view business settings. Cannot edit roles or business settings.', true),
  ('00000000-0000-0000-0000-000000000003', null, 'Staff', 'Standard team access. Cannot access people management, roles, or settings.', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Map capabilities to preset roles
INSERT INTO public.role_capabilities (role_id, capability_id)
SELECT '00000000-0000-0000-0000-000000000001'::uuid, id FROM public.capabilities
ON CONFLICT DO NOTHING;

INSERT INTO public.role_capabilities (role_id, capability_id)
SELECT '00000000-0000-0000-0000-000000000002'::uuid, id FROM public.capabilities WHERE key IN ('canManagePeople', 'canViewBusinessSettings')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- Tenant Scoping Helper Function (SECURITY DEFINER)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.current_business_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT business_id 
  FROM public.people 
  WHERE user_id = (SELECT auth.uid()) 
  LIMIT 1;
$$;

-- Grant EXECUTE to authenticated users
GRANT EXECUTE ON FUNCTION public.current_business_id() TO authenticated;

-- ==============================================================================
-- Enable Row Level Security (RLS) on All Tables
-- ==============================================================================

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_installed_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

-- Grant REST Data API table access to anon and authenticated
GRANT SELECT ON public.workspace_apps TO anon, authenticated;
GRANT SELECT ON public.capabilities TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.people TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_capabilities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_installed_apps TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_events TO authenticated;

-- ------------------------------------------------------------------------------
-- RLS Policies
-- ------------------------------------------------------------------------------

-- 1. workspace_apps Policies
CREATE POLICY "Public read workspace_apps"
  ON public.workspace_apps FOR SELECT
  USING (true);

-- 2. capabilities Policies
CREATE POLICY "Public read capabilities"
  ON public.capabilities FOR SELECT
  USING (true);

-- 3. businesses Policies
CREATE POLICY "Authenticated select owned business"
  ON public.businesses FOR SELECT
  TO authenticated
  USING (id = public.current_business_id() OR owner_id = (SELECT auth.uid()));

CREATE POLICY "Authenticated insert business"
  ON public.businesses FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "Authenticated update business"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (id = public.current_business_id())
  WITH CHECK (id = public.current_business_id());

-- 4. people Policies
CREATE POLICY "Authenticated select people in same business"
  ON public.people FOR SELECT
  TO authenticated
  USING (business_id = public.current_business_id() OR user_id = (SELECT auth.uid()));

CREATE POLICY "Authenticated insert people in business"
  ON public.people FOR INSERT
  TO authenticated
  WITH CHECK (business_id = public.current_business_id() OR user_id = (SELECT auth.uid()));

CREATE POLICY "Authenticated update people in business"
  ON public.people FOR UPDATE
  TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());

CREATE POLICY "Authenticated delete people in business"
  ON public.people FOR DELETE
  TO authenticated
  USING (business_id = public.current_business_id());

-- 5. roles Policies
CREATE POLICY "Authenticated select roles"
  ON public.roles FOR SELECT
  TO authenticated
  USING (business_id IS NULL OR business_id = public.current_business_id());

CREATE POLICY "Authenticated insert roles"
  ON public.roles FOR INSERT
  TO authenticated
  WITH CHECK (business_id = public.current_business_id());

CREATE POLICY "Authenticated update roles"
  ON public.roles FOR UPDATE
  TO authenticated
  USING (business_id = public.current_business_id())
  WITH CHECK (business_id = public.current_business_id());

CREATE POLICY "Authenticated delete custom roles"
  ON public.roles FOR DELETE
  TO authenticated
  USING (business_id = public.current_business_id() AND is_preset = false);

-- 6. role_capabilities Policies
CREATE POLICY "Authenticated select role_capabilities"
  ON public.role_capabilities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.roles r
      WHERE r.id = role_capabilities.role_id
        AND (r.business_id IS NULL OR r.business_id = public.current_business_id())
    )
  );

CREATE POLICY "Authenticated modify role_capabilities"
  ON public.role_capabilities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.roles r
      WHERE r.id = role_capabilities.role_id
        AND r.business_id = public.current_business_id()
    )
  );

-- 7. business_installed_apps Policies
CREATE POLICY "Authenticated select installed apps"
  ON public.business_installed_apps FOR SELECT
  TO authenticated
  USING (business_id = public.current_business_id());

CREATE POLICY "Authenticated insert installed apps"
  ON public.business_installed_apps FOR INSERT
  TO authenticated
  WITH CHECK (business_id = public.current_business_id());

CREATE POLICY "Authenticated delete installed apps"
  ON public.business_installed_apps FOR DELETE
  TO authenticated
  USING (business_id = public.current_business_id());

-- 8. activity_events Policies
CREATE POLICY "Authenticated select activity events"
  ON public.activity_events FOR SELECT
  TO authenticated
  USING (business_id = public.current_business_id());

CREATE POLICY "Authenticated insert activity events"
  ON public.activity_events FOR INSERT
  TO authenticated
  WITH CHECK (business_id = public.current_business_id());
