/**
 * APP_REGISTRY
 *
 * The single source of truth for all workspace apps — installed or coming soon.
 *
 * To add a new app in the future:
 *   1. Add one entry here.
 *   2. That's it. No sidebar changes, no context changes, no routing changes until ready.
 *
 * When the dynamic sidebar is implemented, it will read from WorkspaceContext.apps
 * where installed === true && showInSidebar === true, and render nav items automatically.
 *
 * iconKey maps to a Lucide icon. Resolve the actual component in the UI layer (WorkspacePage).
 * This keeps the registry free of React imports and safe to import anywhere.
 */

import type { WorkspaceApp } from '../../types';

export const APP_REGISTRY: WorkspaceApp[] = [
  // ── Installed ────────────────────────────────────────────────────────────────
  {
    id: 'app-team',
    slug: 'team',
    name: 'Team',
    description: 'Manage your people, invite team members, and control who does what.',
    iconKey: 'Users',
    status: 'installed',
    installed: true,
    installedAt: new Date().toISOString(),
    navTarget: 'people',
    showInSidebar: true,
  },
  {
    id: 'app-inventory',
    slug: 'inventory',
    name: 'Inventory',
    description: 'Track your products, stock levels, and manage what your business holds.',
    iconKey: 'Package',
    status: 'installed',
    installed: true,
    installedAt: new Date().toISOString(),
    navTarget: 'inventory', // Will be enabled when Room 4 (Inventory) is built
    showInSidebar: true,
  },

  // ── Coming Soon ───────────────────────────────────────────────────────────────
  {
    id: 'app-orders',
    slug: 'orders',
    name: 'Orders',
    description: 'Track customer orders from request to delivery, all in one place.',
    iconKey: 'ShoppingBag',
    status: 'coming_soon',
    installed: false,
    showInSidebar: false,
  },
  {
    id: 'app-marketplace',
    slug: 'marketplace',
    name: 'Marketplace',
    description: 'Connect with trusted suppliers and service providers for your business.',
    iconKey: 'Store',
    status: 'coming_soon',
    installed: false,
    showInSidebar: false,
  },
  {
    id: 'app-attendance',
    slug: 'attendance',
    name: 'Attendance',
    description: 'Track your team\'s working hours and daily attendance records.',
    iconKey: 'ClipboardList',
    status: 'coming_soon',
    installed: false,
    showInSidebar: false,
  },
  {
    id: 'app-assets',
    slug: 'assets',
    name: 'Assets',
    description: 'Keep a record of every machine, vehicle, and physical asset your business owns.',
    iconKey: 'Wrench',
    status: 'coming_soon',
    installed: false,
    showInSidebar: false,
  },
  {
    id: 'app-production',
    slug: 'production',
    name: 'Production',
    description: 'Plan and track manufacturing batches, work orders, and output targets.',
    iconKey: 'Factory',
    status: 'coming_soon',
    installed: false,
    showInSidebar: false,
  },
];
