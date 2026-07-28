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

  const filteredPeople = people.filter(p => 
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.emailOrPhone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="People"
        subtitle="Manage the team members who work in your business and control their access."
        action={
          <Button onClick={onNavigateInvite}>
            <UserPlus className="h-5 w-5" />
            Invite Person
          </Button>
        }
      />

      {/* Search Input */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12"
          />
        </div>
      </div>

      {/* People List */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm">
        {filteredPeople.length === 0 ? (
          <div className="p-12 text-center">
            <User className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-zinc-900">No people found</h3>
            <p className="text-base text-zinc-500 mt-1">Try a different search or invite a new team member.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredPeople.map((person) => {
              const role = getRoleById(person.roleId);
              return (
                <div
                  key={person.id}
                  onClick={() => onSelectPerson(person.id)}
                  className="p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 font-bold text-lg">
                      {person.fullName.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-base font-semibold text-zinc-900">
                          {person.fullName}
                        </h3>
                        {person.status === 'invited' && (
                          <Badge variant="warning">Pending Invite</Badge>
                        )}
                      </div>
                      <p className="text-sm text-zinc-500 mt-0.5">
                        {person.emailOrPhone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-zinc-100 text-zinc-800 rounded-lg text-sm font-medium">
                        {role?.name || 'Staff'}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-400" />
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
