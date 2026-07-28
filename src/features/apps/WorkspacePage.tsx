import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { WorkspaceApp } from '../../types';
import {
  Users,
  Package,
  ShoppingBag,
  Store,
  ClipboardList,
  Wrench,
  Factory,
  ArrowUpRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ─── Icon registry ────────────────────────────────────────────────────────────
// Maps iconKey string from the registry to the actual Lucide component.
// All icon resolution happens here — the registry stays free of React imports.
const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Package,
  ShoppingBag,
  Store,
  ClipboardList,
  Wrench,
  Factory,
};

function resolveIcon(iconKey: string): LucideIcon {
  return ICON_MAP[iconKey] ?? Package;
}

// ─── App Card — Installed ─────────────────────────────────────────────────────
interface InstalledCardProps {
  app: WorkspaceApp;
  onOpen: (app: WorkspaceApp) => void;
}

const InstalledCard: React.FC<InstalledCardProps> = ({ app, onOpen }) => {
  const Icon = resolveIcon(app.iconKey);
  // Inventory is installed but Room 4 is not built yet — Open is disabled
  const canOpen = app.slug !== 'inventory';

  return (
    <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 flex flex-col gap-5 hover:border-zinc-300 transition-colors duration-150">
      {/* Icon + Status */}
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
          <Icon className="h-6 w-6 text-zinc-700" />
        </div>
        <Badge variant="success" size="sm">Installed</Badge>
      </div>

      {/* Name + Description */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-zinc-900 tracking-tight">{app.name}</h3>
        <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{app.description}</p>
      </div>

      {/* Open button */}
      <div>
        {canOpen ? (
          <Button
            variant="secondary"
            size="md"
            onClick={() => onOpen(app)}
            className="w-full"
          >
            Open
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        ) : (
          <div
            title="Inventory will be available in the next update."
            className="w-full"
          >
            <Button
              variant="secondary"
              size="md"
              disabled
              className="w-full opacity-40 cursor-not-allowed"
            >
              Open
              <ArrowUpRight className="h-4 w-4" />
            </Button>
            <p className="text-xs text-center text-zinc-400 mt-2">Coming in the next update</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── App Card — Coming Soon ───────────────────────────────────────────────────
interface ComingSoonCardProps {
  app: WorkspaceApp;
}

const ComingSoonCard: React.FC<ComingSoonCardProps> = ({ app }) => {
  const Icon = resolveIcon(app.iconKey);

  return (
    <div className="bg-zinc-50 border border-zinc-200/60 rounded-3xl p-6 sm:p-8 flex flex-col gap-5">
      {/* Icon + Badge */}
      <div className="flex items-start justify-between">
        <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center">
          <Icon className="h-6 w-6 text-zinc-400" />
        </div>
        <Badge variant="neutral" size="sm">Coming Soon</Badge>
      </div>

      {/* Name + Description */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-zinc-500 tracking-tight">{app.name}</h3>
        <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{app.description}</p>
      </div>
    </div>
  );
};

// ─── WorkspacePage ────────────────────────────────────────────────────────────
interface WorkspacePageProps {
  onNavigate: (tab: 'dashboard' | 'people' | 'roles' | 'settings') => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({ onNavigate }) => {
  const { apps } = useWorkspace();

  const installedApps = apps.filter(a => a.installed);
  const comingSoonApps = apps.filter(a => !a.installed);

  const handleOpen = (app: WorkspaceApp) => {
    if (app.navTarget === 'people') {
      onNavigate('people');
    }
    // Future: when inventory is built, add: else if (app.navTarget === 'inventory') onNavigate('inventory')
  };

  return (
    <div className="max-w-4xl mx-auto">

      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight">
          Workspace
        </h1>
        <p className="text-base text-zinc-500 mt-2">
          The tools your business runs on.
        </p>
      </div>

      {/* Section 1: Installed */}
      <section className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">
            Installed
          </h2>
          <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">
            {installedApps.length}
          </span>
        </div>

        {installedApps.length === 0 ? (
          <div className="bg-zinc-50 border border-zinc-200 rounded-3xl px-8 py-12 text-center">
            <p className="text-sm font-semibold text-zinc-600">No tools installed yet.</p>
            <p className="text-xs text-zinc-400 mt-1">Your installed workspace tools will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {installedApps.map(app => (
              <InstalledCard key={app.id} app={app} onOpen={handleOpen} />
            ))}
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="border-t border-zinc-200 mb-14" />

      {/* Section 2: Coming Soon */}
      <section>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-widest">
            Coming Soon
          </h2>
        </div>
        <p className="text-sm text-zinc-400 mb-6">
          More tools are on the way. Your workspace will grow with your business.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comingSoonApps.map(app => (
            <ComingSoonCard key={app.id} app={app} />
          ))}
        </div>
      </section>

    </div>
  );
};
