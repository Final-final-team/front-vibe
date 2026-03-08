import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from '../App';
import NotFoundPage from '../pages/NotFoundPage';
import ReviewDetailPage from '../pages/ReviewDetailPage';
import ReviewEditorPage from '../pages/ReviewEditorPage';
import TaskListPage from '../pages/TaskListPage';
import TaskReviewsPage from '../pages/TaskReviewsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <Navigate to="/tasks" replace /> },
      { path: '/tasks', element: <TaskListPage /> },
      { path: '/tasks/:taskId/reviews', element: <TaskReviewsPage /> },
      { path: '/tasks/:taskId/reviews/new', element: <ReviewEditorPage mode="create" /> },
      { path: '/reviews/:reviewId', element: <ReviewDetailPage /> },
      { path: '/reviews/:reviewId/edit', element: <ReviewEditorPage mode="edit" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
