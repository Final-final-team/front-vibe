import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { appConfig } from '../shared/config/app-config';

export default function RouteErrorPage() {
  const error = useRouteError();

  const title = isRouteErrorResponse(error)
    ? `${error.status} 오류가 발생했습니다`
    : '페이지 렌더 중 오류가 발생했습니다';

  const description = isRouteErrorResponse(error)
    ? error.statusText || '라우터 응답 오류가 발생했습니다.'
    : error instanceof Error
      ? error.message
      : '예상하지 못한 오류가 발생했습니다.';

  return (
    <div className="rounded-3xl border border-amber-200 bg-white px-6 py-16 text-center">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Route Error</div>
      <h2 className="mt-3 text-3xl font-semibold text-gray-900">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-gray-600">{description}</p>
      <Link
        to={`/projects/${appConfig.defaultProjectId}/tasks`}
        className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        업무 목록으로 이동
      </Link>
    </div>
  );
}
