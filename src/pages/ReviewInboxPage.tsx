import { useQueries } from '@tanstack/react-query';
import { FileSearch, MessageSquareWarning, SendHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchTaskReviews } from '../features/review/api';
import { reviewKeys, useTasks } from '../features/review/hooks';
import { useProjectTaskMeta } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import Card from '../shared/ui/Card';
import MetricCard from '../shared/ui/MetricCard';
import StatusPill from '../shared/ui/StatusPill';

export default function ReviewInboxPage() {
  const { currentProject } = useWorkspace();
  const { data: taskMeta = [] } = useProjectTaskMeta(currentProject?.id ?? null);
  const { data: tasks = [] } = useTasks();

  const reviewQueries = useQueries({
    queries: taskMeta.map((meta) => ({
      queryKey: reviewKeys.taskReviews(meta.taskId),
      queryFn: () => fetchTaskReviews(meta.taskId),
    })),
  });

  const inboxRows = taskMeta.map((meta, index) => {
    const task = tasks.find((item) => item.id === meta.taskId);
    const latestReview = reviewQueries[index]?.data?.[0];

    return {
      meta,
      task,
      latestReview,
    };
  });

  const waitingQueue = inboxRows.filter((row) => row.task?.latestReviewStatus === 'IN_REVIEW');
  const approved = inboxRows.filter((row) => row.latestReview?.status === 'APPROVED');
  const empty = inboxRows.filter((row) => !row.latestReview);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-3">
        <MetricCard
          label="Pending Review"
          value={`${waitingQueue.length}건`}
          hint="현재 승인 또는 반려가 필요한 업무"
          icon={<SendHorizontal size={18} />}
        />
        <MetricCard
          label="Approved Rounds"
          value={`${approved.length}건`}
          hint="최근 승인된 검토 라운드"
          icon={<FileSearch size={18} />}
        />
        <MetricCard
          label="No Review Yet"
          value={`${empty.length}건`}
          hint="아직 검토 라운드가 생성되지 않은 업무"
          icon={<MessageSquareWarning size={18} />}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
        <Card title="Review Inbox" description="프로젝트 단위 검토 큐와 최근 라운드를 모아봅니다.">
          <div className="overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr] border-b border-gray-200 pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                <div>업무</div>
                <div>도메인</div>
                <div>현재 상태</div>
                <div>최신 라운드</div>
                <div>진입</div>
              </div>
              <div className="divide-y divide-gray-100">
                {inboxRows.map(({ meta, task, latestReview }) => (
                  <div
                    key={meta.taskId}
                    className="grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-4 py-4 text-sm"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{task?.title}</div>
                      <div className="mt-1 text-gray-500">{task?.summary}</div>
                    </div>
                    <div className="flex items-center">
                      <StatusPill tone="teal">{meta.domain}</StatusPill>
                    </div>
                    <div className="flex items-center">
                      <StatusPill
                        tone={
                          task?.latestReviewStatus === 'COMPLETED'
                            ? 'green'
                            : task?.latestReviewStatus === 'IN_REVIEW'
                              ? 'amber'
                              : 'slate'
                        }
                      >
                        {task?.latestReviewStatus === 'COMPLETED'
                          ? '완료'
                          : task?.latestReviewStatus === 'IN_REVIEW'
                            ? '검토중'
                            : '진행중'}
                      </StatusPill>
                    </div>
                    <div className="flex items-center">
                      {latestReview ? (
                        <StatusPill
                          tone={
                            latestReview.status === 'APPROVED'
                              ? 'green'
                              : latestReview.status === 'REJECTED'
                                ? 'rose'
                                : latestReview.status === 'CANCELLED'
                                  ? 'slate'
                                  : 'amber'
                          }
                        >
                          Round {latestReview.roundNo} · {latestReview.status}
                        </StatusPill>
                      ) : (
                        <StatusPill tone="slate">미상신</StatusPill>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/tasks/${meta.taskId}/reviews`}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        목록
                      </Link>
                      {latestReview && (
                        <Link
                          to={`/reviews/${latestReview.reviewId}`}
                          className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                        >
                          상세
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card title="검토 진입 패턴" description="업무와 검토 탭의 관계를 명시적으로 둡니다.">
            <ul className="space-y-3 text-sm leading-6 text-gray-600">
              <li>업무 탭에서는 row나 상세 패널을 통해 검토 흐름으로 진입합니다.</li>
              <li>검토 탭은 inbox 스타일로 현재 처리할 라운드를 모아보는 목적에 집중합니다.</li>
              <li>상세/수정/상신 화면은 기존 review 라우트를 그대로 사용합니다.</li>
            </ul>
          </Card>

          <Card title="도메인 정책 미확정" description="이번 구현에서는 구조상만 반영하고 실제 정책은 보류한 항목">
            <ul className="space-y-3 text-sm leading-6 text-gray-600">
              <li>프로젝트 종료/재개/삭제 전이 규칙은 아직 확정되지 않았습니다.</li>
              <li>역할 해제 이벤트와 보고 승인 권한 모델은 추후 정책 합의가 필요합니다.</li>
              <li>알림/실시간 정책은 review 도메인 이벤트 확정 이후 단계로 남겨둡니다.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
