import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">404</div>
      <h2 className="mt-3 text-3xl font-semibold text-gray-900">페이지를 찾을 수 없습니다.</h2>
      <p className="mt-3 text-sm text-gray-600">
        현재 라우트 구조는 `/tasks`, `/tasks/:taskId/reviews`, `/reviews/:reviewId` 중심으로 구성됩니다.
      </p>
      <Link
        to="/tasks"
        className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        업무 목록으로 이동
      </Link>
    </div>
  );
}
