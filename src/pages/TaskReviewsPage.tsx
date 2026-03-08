import { FilePenLine, SendHorizontal } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import ReviewSummaryTable from '../features/review/components/ReviewSummaryTable';
import { useTaskReviews, useTasks } from '../features/review/hooks';

export default function TaskReviewsPage() {
  const { taskId: taskIdParam } = useParams();
  const taskId = Number(taskIdParam);
  const { data: tasks = [] } = useTasks();
  const task = tasks.find((item) => item.id === taskId);
  const { data: reviews = [], isLoading, error } = useTaskReviews(taskId);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-white px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Task #{taskId}
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">
              {task?.title ?? '선택된 업무의 review 목록'}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              목록은 `GET /api/v1/tasks/{'{taskId}'}/reviews`에 1:1 매핑됩니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/tasks/${taskId}/reviews/new`}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <SendHorizontal size={16} />
              검토 상신
            </Link>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-700"
            >
              <FilePenLine size={16} />
              업무 목록
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {(error as Error).message}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-3xl border border-gray-200 bg-white px-6 py-12 text-sm text-gray-500">
          review 목록을 불러오는 중입니다.
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
          아직 review 라운드가 없습니다.
        </div>
      ) : (
        <ReviewSummaryTable reviews={reviews} />
      )}
    </div>
  );
}
