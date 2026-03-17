import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import AuditLogsPage from '../pages/AuditLogsPage';
import AuthCallbackPage from '../pages/AuthCallbackPage';
import LoginPage from '../pages/LoginPage';
import MembersPage from '../pages/MembersPage';
import MilestonesPage from '../pages/MilestonesPage';
import NotFoundPage from '../pages/NotFoundPage';
import ReviewDetailPage from '../pages/ReviewDetailPage';
import ReviewEditorPage from '../pages/ReviewEditorPage';
import ReviewInboxPage from '../pages/ReviewInboxPage';
import RolesPermissionsPage from '../pages/RolesPermissionsPage';
import ShadcnLabPage from '../pages/ShadcnLabPage';
import TaskListPage from '../pages/TaskListPage';
import TaskReviewsPage from '../pages/TaskReviewsPage';
import { appConfig } from '../shared/config/app-config';

const defaultProjectPath = `/projects/${appConfig.defaultProjectId}`;

export const router = createBrowserRouter([
  { path: '/design-lab', element: <ShadcnLabPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/auth/callback', element: <AuthCallbackPage /> },
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <Navigate to={`${defaultProjectPath}/tasks`} replace /> },
      { path: '/tasks', element: <Navigate to={`${defaultProjectPath}/tasks`} replace /> },
      { path: '/reviews', element: <Navigate to={`${defaultProjectPath}/reviews`} replace /> },
      { path: '/logs', element: <Navigate to={`${defaultProjectPath}/logs`} replace /> },
      { path: '/members', element: <Navigate to={`${defaultProjectPath}/members`} replace /> },
      { path: '/roles', element: <Navigate to={`${defaultProjectPath}/roles`} replace /> },
      { path: '/milestones', element: <Navigate to={`${defaultProjectPath}/milestones`} replace /> },
      { path: '/projects/:projectId/logs', element: <AuditLogsPage /> },
      { path: '/projects/:projectId/members', element: <MembersPage /> },
      { path: '/projects/:projectId/roles', element: <RolesPermissionsPage /> },
      { path: '/projects/:projectId/milestones', element: <MilestonesPage /> },
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
