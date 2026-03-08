import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTasks } from '../features/review/hooks';
import type { TaskStatus } from '../features/review/types';

const statusMap: Record<TaskStatus, string> = {
  IN_PROGRESS: '진행중',
  IN_REVIEW: '검토중',
  COMPLETED: '완료',
};

export default function TaskListPage() {
  const { data: tasks = [] } = useTasks();

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-gray-200 bg-white px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              Review-enabled tasks
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">
              기존 업무관리 보드 틀을 유지한 상태로, review 기능이 붙은 업무만 리스트업합니다.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            현재 구조: <strong className="text-gray-900">Vite + React Router + TanStack Query</strong>
          </div>
        </div>
      </section>

      <section className="w-full overflow-x-auto">
        <div className="min-w-[960px]">
          <div className="flex items-center h-[42px] border-y border-gray-200 bg-white text-sm text-gray-500 font-medium">
            <div className="w-[56px] border-r border-gray-200 h-full flex items-center justify-center shrink-0">
              <input type="checkbox" className="w-3.5 h-3.5 rounded-sm border-gray-300 text-blue-600" />
            </div>
            <div className="flex-1 min-w-[280px] border-r border-gray-200 h-full flex items-center px-4 shrink-0">
              업무
            </div>
            <div className="w-[160px] shrink-0 border-r border-gray-200 h-full flex items-center justify-center">
              상태
            </div>
            <div className="w-[220px] shrink-0 border-r border-gray-200 h-full flex items-center justify-center">
              요약
            </div>
            <div className="w-[180px] shrink-0 border-r border-gray-200 h-full flex items-center justify-center">
              Review 목록
            </div>
            <div className="w-[140px] shrink-0 h-full flex items-center justify-center">
              빠른 상신
            </div>
          </div>

          <div className="flex flex-col relative z-0">
            {tasks.map((task, index) => (
              <div
                key={task.id}
                className="flex items-center h-[56px] border-b border-gray-200 hover:bg-gray-50 group bg-white transition-colors relative"
              >
                <div
                  className="absolute left-0 top-0 bottom-0 w-1.5 z-10"
                  style={{
                    backgroundColor:
                      index % 3 === 0 ? '#e2445c' : index % 3 === 1 ? '#579bfc' : '#00c875',
                  }}
                />
                <div className="w-[50px] h-full flex items-center justify-center border-r border-gray-200 ml-[6px] shrink-0 bg-[#f5f6f8]">
                  <input type="checkbox" className="w-3.5 h-3.5 rounded-sm border-gray-300 text-blue-600" />
                </div>
                <div className="flex-1 min-w-[280px] h-full flex flex-col justify-center px-4 border-r border-gray-200">
                  <div className="text-[14px] font-medium text-gray-800">{task.title}</div>
                  <div className="truncate text-xs text-gray-500">{task.summary}</div>
                </div>
                <div className="w-[160px] shrink-0 h-full border-r border-gray-200 p-[1px] bg-white">
                  <div className="w-full h-full flex items-center justify-center text-[13px] bg-[#f5f6f8] text-gray-700 font-medium">
                    {statusMap[task.latestReviewStatus]}
                  </div>
                </div>
                <div className="w-[220px] shrink-0 h-full flex items-center border-r border-gray-200 px-4 text-[13px] text-gray-600">
                  review 진입 및 상태 관리
                </div>
                <div className="w-[180px] shrink-0 h-full border-r border-gray-200 flex items-center justify-center">
                  <Link
                    to={`/tasks/${task.id}/reviews`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    review 목록
                    <ArrowRight size={15} />
                  </Link>
                </div>
                <div className="w-[140px] shrink-0 h-full flex items-center justify-center">
                  <Link
                    to={`/tasks/${task.id}/reviews/new`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:border-blue-200 hover:text-blue-700"
                  >
                    상신
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
