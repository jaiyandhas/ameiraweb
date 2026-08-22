import React, { useState } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { UserPlus, Search, User, ChevronRight } from 'lucide-react';

interface PeoplePageProps {
  onNavigateInvite: () => void;
  onSelectPerson: (personId: string) => void;
}

export const PeoplePage: React.FC<PeoplePageProps> = ({
  onNavigateInvite,
  onSelectPerson
}) => {
  const { people, getRoleById } = useWorkspace();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'invited'>('all');

  const filteredPeople = people.filter(p => {
    const matchesSearch = 
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.emailOrPhone.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = people.filter(p => p.status === 'active').length;
  const invitedCount = people.filter(p => p.status === 'invited').length;

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="People"
        subtitle="Manage the team members in your business and assign their access level."
        action={
          <Button size="lg" onClick={onNavigateInvite} className="px-6 shadow-sm">
            <UserPlus className="h-5 w-5" />
            Invite Person
          </Button>
        }
      />

      {/* Filter & Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 bg-white"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-200/60 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All ({people.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              statusFilter === 'active'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('invited')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              statusFilter === 'invited'
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Invited ({invitedCount})
          </button>
        </div>
      </div>

      {/* Scannable People List */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-sm">
        {filteredPeople.length === 0 ? (
          <div className="p-16 text-center">
            <div className="h-14 w-14 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <User className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">No people found</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">
              {search 
                ? 'No team members match your search criteria. Try a different search term.' 
                : 'Your team list is currently empty. Invite your first team member to collaborate.'}
            </p>
            {!search && (
              <Button size="md" onClick={onNavigateInvite} className="mt-6">
                <UserPlus className="h-4 w-4" />
                Invite Person
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredPeople.map((person) => {
              const role = getRoleById(person.roleId);
              const isOwner = role?.name === 'Owner' || person.roleId === 'role-owner';

              return (
                <div
                  key={person.id}
                  onClick={() => onSelectPerson(person.id)}
                  className="p-5 sm:p-6 flex items-center justify-between hover:bg-zinc-50/80 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4 sm:gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-sm">
                      {person.fullName.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base font-bold text-zinc-900 group-hover:text-zinc-800 transition-colors">
                          {person.fullName}
                        </h3>
                        {person.status === 'invited' ? (
                          <Badge variant="warning">Invite Pending</Badge>
                        ) : (
                          <Badge variant="success">Active</Badge>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500 mt-0.5 font-medium">
                        {person.emailOrPhone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold ${
                        isOwner
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-100 text-zinc-800 border border-zinc-200/60'
                      }`}>
                        {role?.name || 'Staff'}
                      </span>
                      <p className="text-xs text-zinc-400 mt-1 hidden sm:block">
                        Joined {person.joinedAt}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
