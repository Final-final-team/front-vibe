import { useEffect, useMemo, useState } from 'react';
import { FileText, LoaderCircle, SendHorizontal, Users } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useSubmitReview } from '../hooks';
import { ApiError } from '../api';
import AppModal from '../../../shared/ui/AppModal';
import { parseIdList } from '../../../shared/lib/format';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number | null;
  taskTitle?: string | null;
  onSubmitted?: (reviewId: number) => void;
};

export default function ReviewComposerModal({
  open,
  onOpenChange,
  taskId,
  taskTitle,
  onSubmitted,
}: Props) {
  const submitMutation = useSubmitReview();
  const [content, setContent] = useState('');
  const [references, setReferences] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const parsedReferences = useMemo(() => parseIdList(references), [references]);

  useEffect(() => {
    if (!open) {
      setContent('');
      setReferences('');
      setErrorMessage(null);
    }
  }, [open]);

  async function handleSubmit() {
    if (!taskId) {
      return;
    }

    setErrorMessage(null);

    try {
      const created = await submitMutation.mutateAsync({
        taskId,
        input: {
          content: content.trim(),
          referenceUserIds: parsedReferences,
          attachments: [],
        },
      });

      onOpenChange(false);
      onSubmitted?.(created.reviewId);
    } catch (error) {
      const apiError = error as ApiError;
      setErrorMessage(apiError.message);
    }
  }

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="검토 상신하기"
      description="업무 상세를 벗어나지 않고 바로 검토 라운드를 생성합니다."
      size="lg"
      badges={
        taskTitle ? (
          <span className="rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-semibold text-muted-foreground">
            {taskTitle}
          </span>
        ) : null
      }
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            제출 후 최신 검토 상세로 바로 이어집니다.
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              닫기
            </Button>
            <Button disabled={!taskId || !content.trim() || submitMutation.isPending} onClick={() => void handleSubmit()}>
              {submitMutation.isPending ? <LoaderCircle className="animate-spin" size={16} /> : <SendHorizontal size={16} />}
              {submitMutation.isPending ? '상신 중' : '상신하기'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="rounded-[24px] border border-border/70 bg-[linear-gradient(135deg,#ffffff,#f7f9fc)] px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">검토 요청 요약</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                이번 라운드에서 확인받아야 할 변경점, 결정이 필요한 포인트, 참고해야 할 리스크를 짧고 명확하게 적는 쪽이 낫습니다.
              </p>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm leading-6 text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-foreground">검토 본문</span>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={12}
            className="min-h-[280px] w-full rounded-[22px] border border-border/70 bg-background px-4 py-4 text-sm leading-7 text-foreground outline-none transition focus:border-primary/30"
            placeholder="예: 이번 라운드에서는 업무 상태 변경 로직과 상신 버튼 UX를 중점으로 확인해 주세요."
          />
        </label>

        <label className="block space-y-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users size={15} />
            참조자 ID
          </span>
          <Input
            value={references}
            onChange={(event) => setReferences(event.target.value)}
            placeholder="예: 201, 202"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            현재는 사용자 검색 API가 없어 숫자 ID 입력 방식으로 연결합니다. 비워도 상신은 가능합니다.
          </p>
        </label>

        <div className="rounded-[20px] border border-border/70 bg-muted/20 px-4 py-4 text-sm leading-6 text-muted-foreground">
          참조자 수 <span className="font-semibold text-foreground">{parsedReferences.length}</span>
          <span className="mx-2 text-border">|</span>
          첨부 presign API는 아직 연결되지 않아 상신 후 상세에서 첨부를 추가하는 흐름을 유지합니다.
        </div>
      </div>
    </AppModal>
  );
}
