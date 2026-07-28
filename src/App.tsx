import React, { useState, Suspense, lazy } from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { LoadingScreen } from './components/ui/LoadingScreen';

// React Lazy Loading for Production Chunk Optimization
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const VerifyPage = lazy(() => import('./pages/VerifyPage').then(m => ({ default: m.VerifyPage })));
const CreateBusinessPage = lazy(() => import('./pages/CreateBusinessPage').then(m => ({ default: m.CreateBusinessPage })));
const WorkspaceShell = lazy(() => import('./components/layout/WorkspaceShell').then(m => ({ default: m.WorkspaceShell })));

const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const PeoplePage = lazy(() => import('./pages/PeoplePage').then(m => ({ default: m.PeoplePage })));
const InvitePersonPage = lazy(() => import('./pages/InvitePersonPage').then(m => ({ default: m.InvitePersonPage })));
const PersonDetailPage = lazy(() => import('./pages/PersonDetailPage').then(m => ({ default: m.PersonDetailPage })));
const RolesPage = lazy(() => import('./pages/RolesPage').then(m => ({ default: m.RolesPage })));
const CreateRolePage = lazy(() => import('./pages/CreateRolePage').then(m => ({ default: m.CreateRolePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

type WorkspaceTab = 'dashboard' | 'people' | 'roles' | 'settings';

const AppContent: React.FC = () => {
  const { activeStep, openAuth, openRegister, goBackToLanding, authInitialMode } = useWorkspace();

  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>('dashboard');
  const [peopleSubView, setPeopleSubView] = useState<'list' | 'invite' | 'detail'>('list');
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [rolesSubView, setRolesSubView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const handleNavigate = (tab: WorkspaceTab) => {
    setWorkspaceTab(tab);
    setPeopleSubView('list');
    setRolesSubView('list');
  };

  // Cross-tab navigation helpers (called from Dashboard quick actions)
  const handleDashboardInvite = () => {
    setWorkspaceTab('people');
    setPeopleSubView('invite');
  };

  const handleDashboardCreateRole = () => {
    setWorkspaceTab('roles');
    setSelectedRoleId(null);
    setRolesSubView('create');
  };

  return (
    <Suspense fallback={<LoadingScreen message="loading ameira..." />}>
      {activeStep === 'landing' && (
        <LandingPage onStart={() => openRegister()} onSignIn={() => openAuth()} />
      )}

      {activeStep === 'login' && (
        <AuthPage initialMode={authInitialMode} onBackToLanding={goBackToLanding} />
      )}

      {activeStep === 'verify' && <VerifyPage />}

      {activeStep === 'create-business' && <CreateBusinessPage />}

      {activeStep === 'workspace' && (
        <WorkspaceShell currentTab={workspaceTab} onNavigate={handleNavigate}>

          {/* Dashboard */}
          {workspaceTab === 'dashboard' && (
            <DashboardPage
              onNavigate={handleNavigate}
              onNavigateInvite={handleDashboardInvite}
              onNavigateCreateRole={handleDashboardCreateRole}
            />
          )}

          {/* People */}
          {workspaceTab === 'people' && (
            <>
              {peopleSubView === 'list' && (
                <PeoplePage
                  onNavigateInvite={() => setPeopleSubView('invite')}
                  onSelectPerson={(id) => { setSelectedPersonId(id); setPeopleSubView('detail'); }}
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

          {/* Roles */}
          {workspaceTab === 'roles' && (
            <>
              {rolesSubView === 'list' && (
                <RolesPage
                  onNavigateCreateRole={() => { setSelectedRoleId(null); setRolesSubView('create'); }}
                  onSelectRole={(id) => { setSelectedRoleId(id); setRolesSubView('edit'); }}
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

          {/* Settings */}
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
