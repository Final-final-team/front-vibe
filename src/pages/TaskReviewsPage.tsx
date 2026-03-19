import { AlertCircle, FilePenLine, SendHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import ReviewComposerModal from '../features/review/components/ReviewComposerModal';
import ReviewSummaryTable from '../features/review/components/ReviewSummaryTable';
import { useTaskReviews, useTasks } from '../features/review/hooks';
import { useProjectMembers } from '../features/workspace/hooks';
import PageHero from '../shared/ui/PageHero';
import StatusPill from '../shared/ui/StatusPill';

export default function TaskReviewsPage() {
  const { projectId: projectIdParam, taskId: taskIdParam } = useParams();
  const taskId = Number(taskIdParam);
  const projectId = Number(projectIdParam);
  const hasValidTaskId = Number.isFinite(taskId) && taskId > 0;
  const [reviewComposerOpen, setReviewComposerOpen] = useState(false);
  const { data: tasks = [] } = useTasks();
  const { data: projectMembers = [] } = useProjectMembers(projectIdParam ?? null);
  const task = tasks.find((item) => item.id === taskId);
  const { data: reviewPage, isLoading, error } = useTaskReviews(hasValidTaskId ? taskId : -1);
  const reviews = reviewPage?.items ?? [];

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={<StatusPill tone="blue">{`Project #${projectId} · Task #${taskId}`}</StatusPill>}
        title={task?.title ?? '선택된 업무의 review 목록'}
        description="목록은 `GET /api/v1/tasks/{taskId}/reviews`의 페이지 응답에 1:1 매핑됩니다."
        actions={
          <>
            <Button className="rounded-2xl" onClick={() => setReviewComposerOpen(true)}>
              <SendHorizontal size={16} />
              검토 상신
            </Button>
            <Link
              to={`/projects/${projectId}/tasks`}
              className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-primary/20 hover:text-primary"
            >
              <FilePenLine size={16} />
              업무 목록
            </Link>
          </>
        }
      />

      {!hasValidTaskId ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              잘못된 taskId로 진입했습니다. 업무 목록에서 review 대상을 다시 선택해주세요.
              <div className="mt-2">
                <Link to={`/projects/${projectId}/tasks`} className="font-semibold text-amber-900 underline underline-offset-2">
                  업무 목록으로 이동
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {(error as Error).message}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-[28px] border border-border/70 bg-background px-6 py-12 text-sm text-muted-foreground">
              review 목록을 불러오는 중입니다.
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-border/70 bg-background px-6 py-12 text-center text-sm text-muted-foreground">
              <div>아직 review 라운드가 없습니다.</div>
              <div className="mt-3">
                <Button className="rounded-2xl" onClick={() => setReviewComposerOpen(true)}>
                  <SendHorizontal size={15} />
                  첫 검토 상신하기
                </Button>
              </div>
            </div>
          ) : (
            <ReviewSummaryTable reviews={reviews} />
          )}
        </>
      )}

      <ReviewComposerModal
        open={reviewComposerOpen}
        onOpenChange={setReviewComposerOpen}
        taskId={hasValidTaskId ? taskId : null}
        taskTitle={task?.title ?? null}
        memberOptions={projectMembers.filter((member) => member.inviteStatus === 'ACTIVE')}
      />
    </div>
  );
}
