import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ReviewForm from '../features/review/components/ReviewForm';
import { useReviewDetail, useSubmitReview, useUpdateReview } from '../features/review/hooks';
import { ApiError } from '../features/review/api';

type Props = {
  mode: 'create' | 'edit';
};

export default function ReviewEditorPage({ mode }: Props) {
  const navigate = useNavigate();
  const { projectId: projectIdParam, taskId: taskIdParam, reviewId: reviewIdParam } = useParams();
  const projectId = Number(projectIdParam);
  const taskId = Number(taskIdParam);
  const reviewId = Number(reviewIdParam);
  const submitMutation = useSubmitReview();
  const updateMutation = useUpdateReview(reviewId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const detailQuery = useReviewDetail(reviewId);
  const initialReview = mode === 'edit' ? detailQuery.data : undefined;

  async function handleSubmit(payload: {
    content: string;
    referenceUserIds: number[];
    files: File[];
  }) {
    setErrorMessage(null);

    try {
      if (mode === 'create') {
        const created = await submitMutation.mutateAsync({
          taskId,
          input: {
            content: payload.content,
            referenceUserIds: payload.referenceUserIds,
            attachments: [],
          },
        });

        navigate(`/reviews/${created.reviewId}`);
        return;
      }

      if (!initialReview) {
        return;
      }

      const updated = await updateMutation.mutateAsync({
        lockVersion: initialReview.lockVersion,
        input: { content: payload.content },
      });

      navigate(`/reviews/${updated.reviewId}`);
    } catch (error) {
      const apiError = error as ApiError;
      setErrorMessage(apiError.message);
    }
  }

  if (mode === 'edit' && detailQuery.isLoading) {
    return <PageShell title="검토 수정" projectId={projectId}>검토 상세를 불러오는 중입니다.</PageShell>;
  }

  return (
    <PageShell title={mode === 'create' ? '검토 상신 / 재상신' : '검토 수정'} projectId={projectId}>
      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      <ReviewForm
        mode={mode}
        initialReview={initialReview}
        onSubmit={handleSubmit}
        submitting={submitMutation.isPending || updateMutation.isPending}
      />
    </PageShell>
  );
}

function PageShell({ title, projectId, children }: { title: string; projectId: number; children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between rounded-3xl border border-gray-200 bg-white px-6 py-5">
        <div>
          <div className="text-xs font-semibold tracking-[0.1em] text-blue-600">
            편집 화면
          </div>
          <h2 className="mt-2 text-2xl font-semibold text-gray-900">{title}</h2>
        </div>
        <Link
          to={`/projects/${projectId}/tasks`}
          className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-200 hover:text-blue-700"
        >
          업무 목록
        </Link>
      </section>
      {children}
    </div>
  );
}
