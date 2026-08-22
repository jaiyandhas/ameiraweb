import React from 'react';
import type { ActivityEvent } from '../../types';

interface ActivityFeedProps {
  activities: ActivityEvent[];
}

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function activityDotColor(type: ActivityEvent['type']): string {
  switch (type) {
    case 'business_created':
      return 'bg-zinc-900';
    case 'person_invited':
    case 'person_joined':
      return 'bg-emerald-500';
    case 'role_created':
    case 'role_assigned':
      return 'bg-blue-500';
    case 'settings_updated':
      return 'bg-amber-500';
    default:
      return 'bg-zinc-400';
  }
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-zinc-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-zinc-900">Today's Activity</h2>
          <p className="text-xs text-zinc-400 mt-0.5">Everything that happened in your workspace.</p>
        </div>
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Live update" />
      </div>

      {activities.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-semibold text-zinc-700">Your workspace is ready.</p>
          <p className="text-xs text-zinc-400 mt-1">Activity will appear here as your team gets started.</p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {activities.map(event => {
            const dotClass = activityDotColor(event.type);
            return (
              <li key={event.id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50/50 transition-colors">
                <span className={`h-2 w-2 rounded-full shrink-0 ${dotClass}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 leading-snug">{event.title}</p>
                </div>
                <span className="text-xs text-zinc-400 shrink-0 tabular-nums font-mono">
                  {relativeTime(event.timestamp)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
