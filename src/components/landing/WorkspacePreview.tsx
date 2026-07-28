import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingBag, 
  Settings, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  Building2
} from 'lucide-react';

export const WorkspacePreview: React.FC = () => {
  const activities = [
    {
      id: 1,
      title: 'Rahul joined Warehouse Team',
      time: '10m ago',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 bg-emerald-50'
    },
    {
      id: 2,
      title: 'Cotton inventory is running low',
      time: '45m ago',
      icon: AlertCircle,
      iconColor: 'text-amber-600 bg-amber-50'
    },
    {
      id: 3,
      title: 'Purchase Request #104 approved',
      time: '2h ago',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 bg-emerald-50'
    },
    {
      id: 4,
      title: 'Supplier replied',
      time: '3h ago',
      icon: MessageSquare,
      iconColor: 'text-zinc-600 bg-zinc-100'
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-zinc-100/60 border-y border-zinc-200/80">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900">
            A real-time workspace for your business.
          </h2>
          <p className="text-lg text-zinc-500 mt-2">
            No charts or graphs. Just the information you and your team need every day.
          </p>
        </div>

        {/* Dashboard Preview Shell */}
        <div className="bg-white border border-zinc-300/80 rounded-3xl overflow-hidden shadow-xl max-w-4xl mx-auto">
          {/* Top Bar */}
          <div className="h-14 bg-zinc-900 text-white px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/ameiralogo.png" alt="Ameira" className="h-7 w-auto object-contain brightness-200" />
              <span className="font-bold text-base tracking-tight">Ameira</span>
              <span className="h-4 w-px bg-zinc-700 mx-1" />
              <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-md bg-zinc-800 text-zinc-300">
                <Building2 className="h-3.5 w-3.5" />
                Apex General Store
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-xs text-zinc-400 font-medium">Live Sync</span>
            </div>
          </div>

          {/* Body */}
          <div className="flex min-h-[380px]">
            {/* Sidebar */}
            <div className="w-52 bg-zinc-50 border-r border-zinc-200 p-4 hidden sm:block">
              <nav className="flex flex-col gap-1">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold">
                  <LayoutDashboard className="h-4 w-4" />
                  Workspace
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-600 text-sm font-medium hover:bg-zinc-100">
                  <Package className="h-4 w-4 text-zinc-400" />
                  Inventory
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-600 text-sm font-medium hover:bg-zinc-100">
                  <Users className="h-4 w-4 text-zinc-400" />
                  People
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-600 text-sm font-medium hover:bg-zinc-100">
                  <ShoppingBag className="h-4 w-4 text-zinc-400" />
                  Marketplace
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-600 text-sm font-medium hover:bg-zinc-100">
                  <Settings className="h-4 w-4 text-zinc-400" />
                  Settings
                </div>
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 sm:p-8 bg-white">
              <div className="mb-6">
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                  Good Morning, Jay
                </h3>
                <p className="text-sm text-zinc-500 mt-1">Here is what happened in your business today.</p>
              </div>

              {/* Today's Activity Card */}
              <div className="border border-zinc-200 rounded-2xl p-6 bg-zinc-50/50">
                <h4 className="text-base font-bold text-zinc-900 mb-4">
                  Today's Activity
                </h4>

                <div className="divide-y divide-zinc-100">
                  {activities.map((act) => {
                    const Icon = act.icon;
                    return (
                      <div key={act.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${act.iconColor}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm sm:text-base font-medium text-zinc-900">
                            {act.title}
                          </span>
                        </div>
                        <span className="text-xs font-mono text-zinc-400">{act.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
