import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import AuthCallbackPage from '../pages/AuthCallbackPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import DefaultEntryRedirectPage from '../pages/DefaultEntryRedirectPage';
import LoginPage from '../pages/LoginPage';
import MembersPage from '../pages/MembersPage';
import MilestonesPage from '../pages/MilestonesPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProjectOnboardingPage from '../pages/ProjectOnboardingPage';
import ProjectsHomePage from '../pages/ProjectsHomePage';
import ReviewDetailPage from '../pages/ReviewDetailPage';
import ReviewEditorPage from '../pages/ReviewEditorPage';
import ReviewInboxPage from '../pages/ReviewInboxPage';
import RolesPermissionsPage from '../pages/RolesPermissionsPage';
import RouteErrorPage from '../pages/RouteErrorPage';
import ShadcnLabPage from '../pages/ShadcnLabPage';
import TaskListPage from '../pages/TaskListPage';
import TaskReviewsPage from '../pages/TaskReviewsPage';
import { appConfig } from '../shared/config/app-config';

const defaultProjectPath = `/projects/${appConfig.defaultProjectId}`;

export const router = createBrowserRouter([
  { path: '/design-lab', element: <ShadcnLabPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  { path: '/:projectId', element: <LegacyProjectRedirect target="tasks" /> },
  { path: '/projects/:projectId', element: <LegacyProjectsBaseRedirect /> },
  { path: '/:projectId/tasks', element: <LegacyProjectRedirect target="tasks" /> },
  { path: '/:projectId/reviews', element: <LegacyProjectRedirect target="reviews" /> },
  { path: '/:projectId/members', element: <LegacyProjectRedirect target="members" /> },
  { path: '/:projectId/roles', element: <LegacyProjectRedirect target="roles" /> },
  { path: '/:projectId/milestones', element: <LegacyProjectRedirect target="milestones" /> },
  { path: '/:projectId/audit-logs', element: <LegacyProjectRedirect target="audit-logs" /> },
  { path: '/:projectId/tasks/:taskId/reviews', element: <LegacyTaskRedirect target="reviews" /> },
  { path: '/:projectId/tasks/:taskId/reviews/new', element: <LegacyTaskRedirect target="reviews/new" /> },
  {
    path: '/',
    element: <App />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <DefaultEntryRedirectPage /> },
      { path: '/projects', element: <ProjectsHomePage /> },
      { path: '/tasks', element: <DefaultEntryRedirectPage /> },
      { path: '/reviews', element: <DefaultEntryRedirectPage /> },
      { path: '/onboarding/project', element: <ProjectOnboardingPage /> },
      { path: '/members', element: <Navigate to={`${defaultProjectPath}/members`} replace /> },
      { path: '/roles', element: <Navigate to={`${defaultProjectPath}/roles`} replace /> },
      { path: '/milestones', element: <Navigate to={`${defaultProjectPath}/milestones`} replace /> },
      { path: '/audit-logs', element: <Navigate to={`${defaultProjectPath}/audit-logs`} replace /> },
      { path: '/projects/:projectId/members', element: <MembersPage /> },
      { path: '/projects/:projectId/roles', element: <RolesPermissionsPage /> },
      { path: '/projects/:projectId/milestones', element: <MilestonesPage /> },
      { path: '/projects/:projectId/audit-logs', element: <AuditLogsPage /> },
      { path: '/projects/:projectId/tasks', element: <TaskListPage /> },
      { path: '/projects/:projectId/reviews', element: <ReviewInboxPage /> },
      { path: '/projects/:projectId/tasks/:taskId/reviews', element: <TaskReviewsPage /> },
      { path: '/projects/:projectId/tasks/:taskId/reviews/new', element: <ReviewEditorPage mode="create" /> },
      { path: '/reviews/:reviewId', element: <ReviewDetailPage /> },
      { path: '/reviews/:reviewId/edit', element: <ReviewEditorPage mode="edit" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

function LegacyProjectRedirect({
  target,
}: {
  target: 'tasks' | 'reviews' | 'members' | 'roles' | 'milestones' | 'audit-logs';
}) {
  const projectId = window.location.pathname.split('/')[1];
  return <Navigate to={`/projects/${projectId}/${target}`} replace />;
}

function LegacyProjectsBaseRedirect() {
  const projectId = window.location.pathname.split('/')[2];
  return <Navigate to={`/projects/${projectId}/tasks`} replace />;
}

function LegacyTaskRedirect({
  target,
}: {
  target: 'reviews' | 'reviews/new';
}) {
  const [, projectId, , taskId] = window.location.pathname.split('/');
  return <Navigate to={`/projects/${projectId}/tasks/${taskId}/${target}`} replace />;
}
