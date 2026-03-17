import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import AuditLogsPage from '../pages/AuditLogsPage';
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

export const router = createBrowserRouter([
  { path: '/design-lab', element: <ShadcnLabPage /> },
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <Navigate to="/tasks" replace /> },
      { path: '/logs', element: <AuditLogsPage /> },
      { path: '/members', element: <MembersPage /> },
      { path: '/roles', element: <RolesPermissionsPage /> },
      { path: '/milestones', element: <MilestonesPage /> },
      { path: '/tasks', element: <TaskListPage /> },
      { path: '/reviews', element: <ReviewInboxPage /> },
      { path: '/tasks/:taskId/reviews', element: <TaskReviewsPage /> },
      { path: '/tasks/:taskId/reviews/new', element: <ReviewEditorPage mode="create" /> },
      { path: '/reviews/:reviewId', element: <ReviewDetailPage /> },
      { path: '/reviews/:reviewId/edit', element: <ReviewEditorPage mode="edit" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
