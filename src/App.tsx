import React, { useState, Suspense, lazy } from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { LoadingScreen } from './components/ui/LoadingScreen';

// React Lazy Loading for Production Chunk Optimization
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(module => ({ default: module.AuthPage })));
const VerifyPage = lazy(() => import('./pages/VerifyPage').then(module => ({ default: module.VerifyPage })));
const CreateBusinessPage = lazy(() => import('./pages/CreateBusinessPage').then(module => ({ default: module.CreateBusinessPage })));
const WorkspaceShell = lazy(() => import('./components/layout/WorkspaceShell').then(module => ({ default: module.WorkspaceShell })));

const PeoplePage = lazy(() => import('./pages/PeoplePage').then(module => ({ default: module.PeoplePage })));
const InvitePersonPage = lazy(() => import('./pages/InvitePersonPage').then(module => ({ default: module.InvitePersonPage })));
const PersonDetailPage = lazy(() => import('./pages/PersonDetailPage').then(module => ({ default: module.PersonDetailPage })));
const RolesPage = lazy(() => import('./pages/RolesPage').then(module => ({ default: module.RolesPage })));
const CreateRolePage = lazy(() => import('./pages/CreateRolePage').then(module => ({ default: module.CreateRolePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));

const AppContent: React.FC = () => {
  const { activeStep, loginWithContact } = useWorkspace();
  
  // Internal workspace sub-views
  const [workspaceTab, setWorkspaceTab] = useState<'people' | 'roles' | 'settings'>('people');
  const [peopleSubView, setPeopleSubView] = useState<'list' | 'invite' | 'detail'>('list');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  
  const [rolesSubView, setRolesSubView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  return (
    <Suspense fallback={<LoadingScreen message="loading ameira..." />}>
      {activeStep === 'landing' && (
        <LandingPage onStart={() => loginWithContact('')} />
      )}

      {activeStep === 'login' && (
        <AuthPage onBackToLanding={() => window.location.reload()} />
      )}

      {activeStep === 'verify' && <VerifyPage />}

      {activeStep === 'create-business' && <CreateBusinessPage />}

      {activeStep === 'workspace' && (
        <WorkspaceShell
          currentTab={workspaceTab}
          onNavigate={(tab) => {
            setWorkspaceTab(tab);
            setPeopleSubView('list');
            setRolesSubView('list');
          }}
        >
          {/* Tab 1: People */}
          {workspaceTab === 'people' && (
            <>
              {peopleSubView === 'list' && (
                <PeoplePage
                  onNavigateInvite={() => setPeopleSubView('invite')}
                  onSelectPerson={(personId) => {
                    setSelectedPersonId(personId);
                    setPeopleSubView('detail');
                  }}
                />
              )}

              {peopleSubView === 'invite' && (
                <InvitePersonPage
                  onBack={() => setPeopleSubView('list')}
                  onSuccess={() => setPeopleSubView('list')}
                />
              )}

              {peopleSubView === 'detail' && selectedPersonId && (
                <PersonDetailPage
                  personId={selectedPersonId}
                  onBack={() => setPeopleSubView('list')}
                />
              )}
            </>
          )}

          {/* Tab 2: Roles & Access */}
          {workspaceTab === 'roles' && (
            <>
              {rolesSubView === 'list' && (
                <RolesPage
                  onNavigateCreateRole={() => {
                    setSelectedRoleId(null);
                    setRolesSubView('create');
                  }}
                  onSelectRole={(roleId) => {
                    setSelectedRoleId(roleId);
                    setRolesSubView('edit');
                  }}
                />
              )}

              {(rolesSubView === 'create' || rolesSubView === 'edit') && (
                <CreateRolePage
                  roleId={selectedRoleId || undefined}
                  onBack={() => setRolesSubView('list')}
                  onSuccess={() => setRolesSubView('list')}
                />
              )}
            </>
          )}

          {/* Tab 3: Settings */}
          {workspaceTab === 'settings' && <SettingsPage />}
        </WorkspaceShell>
      )}
    </Suspense>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  );
}
