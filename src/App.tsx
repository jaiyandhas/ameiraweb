import React, { Suspense, lazy } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { LoadingScreen } from './components/ui/LoadingScreen';

// React Lazy Loading for Production Chunk Optimization
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const VerifyPage = lazy(() => import('./pages/VerifyPage').then(m => ({ default: m.VerifyPage })));
const CreateBusinessPage = lazy(() => import('./pages/CreateBusinessPage').then(m => ({ default: m.CreateBusinessPage })));
const WorkspaceShell = lazy(() => import('./components/layout/WorkspaceShell').then(m => ({ default: m.WorkspaceShell })));

const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const WorkspacePage = lazy(() => import('./features/apps/WorkspacePage').then(m => ({ default: m.WorkspacePage })));
const PeoplePage = lazy(() => import('./pages/PeoplePage').then(m => ({ default: m.PeoplePage })));
const InvitePersonPage = lazy(() => import('./pages/InvitePersonPage').then(m => ({ default: m.InvitePersonPage })));
const PersonDetailPage = lazy(() => import('./pages/PersonDetailPage').then(m => ({ default: m.PersonDetailPage })));
const RolesPage = lazy(() => import('./pages/RolesPage').then(m => ({ default: m.RolesPage })));
const CreateRolePage = lazy(() => import('./pages/CreateRolePage').then(m => ({ default: m.CreateRolePage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

// ─── Route Guard: Require Business ───────────────────────────────────────────
// Guard component — resolves business status before rendering protected routes.
function RequireBusiness({ children }: { children: React.ReactNode }) {
  const { user, businessStatus } = useWorkspace();

  if (businessStatus === 'loading') {
    return <LoadingScreen message="loading workspace..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (businessStatus === 'not_found') {
    return <Navigate to="/create-business" replace />;
  }

  return <>{children}</>;
}

// ─── Route Guard: Require No Business (for Onboarding) ───────────────────────
function RequireNoBusiness({ children }: { children: React.ReactNode }) {
  const { user, businessStatus } = useWorkspace();

  if (businessStatus === 'loading') {
    return <LoadingScreen message="loading workspace..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (businessStatus === 'found') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// ─── Route Guard: Redirect Logged-In Users ───────────────────────────────────
function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { user, businessStatus } = useWorkspace();

  // While business status is in flight for an authenticating/authenticated user, show loading screen
  if (businessStatus === 'loading' && user) {
    return <LoadingScreen message="loading workspace..." />;
  }

  if (user && businessStatus === 'found') {
    return <Navigate to="/dashboard" replace />;
  }

  if (user && businessStatus === 'not_found') {
    return <Navigate to="/create-business" replace />;
  }

  return <>{children}</>;
}

// ─── Page Wrappers with React Router Navigation ───────────────────────────────

function LandingPageWrapper() {
  const navigate = useNavigate();
  return (
    <LandingPage
      onStart={() => navigate('/register')}
      onSignIn={() => navigate('/login')}
    />
  );
}

function AuthPageWrapper({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate();
  return (
    <AuthPage
      initialMode={mode}
      onBackToLanding={() => navigate('/')}
    />
  );
}

function DashboardPageWrapper() {
  const navigate = useNavigate();
  return (
    <DashboardPage
      onNavigate={(tab) => {
        if (tab === 'apps') navigate('/workspace');
        else if (tab === 'people') navigate('/people');
        else if (tab === 'roles') navigate('/roles');
        else if (tab === 'settings') navigate('/settings');
        else navigate('/dashboard');
      }}
      onNavigateInvite={() => navigate('/people/invite')}
      onNavigateCreateRole={() => navigate('/roles/create')}
    />
  );
}

function WorkspacePageWrapper() {
  const navigate = useNavigate();
  return (
    <WorkspacePage
      onNavigate={(tab) => {
        if (tab === 'people') navigate('/people');
        else if (tab === 'roles') navigate('/roles');
        else if (tab === 'settings') navigate('/settings');
        else navigate('/dashboard');
      }}
    />
  );
}

function PeoplePageWrapper() {
  const navigate = useNavigate();
  return (
    <PeoplePage
      onNavigateInvite={() => navigate('/people/invite')}
      onSelectPerson={(id) => navigate(`/people/${id}`)}
    />
  );
}

function InvitePersonPageWrapper() {
  const navigate = useNavigate();
  return (
    <InvitePersonPage
      onBack={() => navigate('/people')}
      onSuccess={() => navigate('/people')}
    />
  );
}

function PersonDetailPageWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <PersonDetailPage
      personId={id || ''}
      onBack={() => navigate('/people')}
    />
  );
}

function RolesPageWrapper() {
  const navigate = useNavigate();
  return (
    <RolesPage
      onNavigateCreateRole={() => navigate('/roles/create')}
      onSelectRole={(id) => navigate(`/roles/${id}/edit`)}
    />
  );
}

function CreateRolePageWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <CreateRolePage
      roleId={id}
      onBack={() => navigate('/roles')}
      onSuccess={() => navigate('/roles')}
    />
  );
}

// ─── Main App Router ──────────────────────────────────────────────────────────

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen message="loading ameira..." />}>
      <Routes>
        {/* Public Landing & Auth Routes */}
        <Route
          path="/"
          element={
            <RedirectIfAuth>
              <LandingPageWrapper />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <AuthPageWrapper mode="login" />
            </RedirectIfAuth>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuth>
              <AuthPageWrapper mode="register" />
            </RedirectIfAuth>
          }
        />
        <Route path="/verify" element={<VerifyPage />} />

        {/* Onboarding Route */}
        <Route
          path="/create-business"
          element={
            <RequireNoBusiness>
              <CreateBusinessPage />
            </RequireNoBusiness>
          }
        />

        {/* Protected Workspace Layout & Sub-Routes */}
        <Route
          element={
            <RequireBusiness>
              <WorkspaceShell>
                <Suspense fallback={<LoadingScreen message="loading section..." />}>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPageWrapper />} />
                    <Route path="/workspace" element={<WorkspacePageWrapper />} />
                    <Route path="/people" element={<PeoplePageWrapper />} />
                    <Route path="/people/invite" element={<InvitePersonPageWrapper />} />
                    <Route path="/people/:id" element={<PersonDetailPageWrapper />} />
                    <Route path="/roles" element={<RolesPageWrapper />} />
                    <Route path="/roles/create" element={<CreateRolePageWrapper />} />
                    <Route path="/roles/:id/edit" element={<CreateRolePageWrapper />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
              </WorkspaceShell>
            </RequireBusiness>
          }
        >
          <Route path="/dashboard" element={null} />
          <Route path="/workspace" element={null} />
          <Route path="/people" element={null} />
          <Route path="/people/invite" element={null} />
          <Route path="/people/:id" element={null} />
          <Route path="/roles" element={null} />
          <Route path="/roles/create" element={null} />
          <Route path="/roles/:id/edit" element={null} />
          <Route path="/settings" element={null} />
          <Route path="*" element={null} />
        </Route>

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <WorkspaceProvider>
        <AppRoutes />
      </WorkspaceProvider>
    </BrowserRouter>
  );
}
