import { useEffect, useMemo, useState } from 'react';
import { FileText, LoaderCircle, SendHorizontal, Users } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useSubmitReview } from '../hooks';
import { ApiError } from '../api';
import AppModal from '../../../shared/ui/AppModal';
import type { ProjectMember } from '../../workspace/types';
import StatusPill from '../../../shared/ui/StatusPill';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: number | null;
  taskTitle?: string | null;
  memberOptions: ProjectMember[];
  onSubmitted?: (reviewId: number) => void;
};

export default function ReviewComposerModal({
  open,
  onOpenChange,
  taskId,
  taskTitle,
  memberOptions,
  onSubmitted,
}: Props) {
  const submitMutation = useSubmitReview();
  const [content, setContent] = useState('');
  const [selectedReferenceId, setSelectedReferenceId] = useState('');
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [referenceIds, setReferenceIds] = useState<number[]>([]);
  const [additionalReviewerIds, setAdditionalReviewerIds] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const referenceOptions = useMemo(
    () => memberOptions.filter((member) => !referenceIds.includes(member.userId) && !additionalReviewerIds.includes(member.userId)),
    [additionalReviewerIds, memberOptions, referenceIds],
  );
  const reviewerOptions = useMemo(
    () => memberOptions.filter((member) => !additionalReviewerIds.includes(member.userId) && !referenceIds.includes(member.userId)),
    [additionalReviewerIds, memberOptions, referenceIds],
  );

  useEffect(() => {
    if (!open) {
      setContent('');
      setSelectedReferenceId('');
      setSelectedReviewerId('');
      setReferenceIds([]);
      setAdditionalReviewerIds([]);
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
          referenceUserIds: referenceIds,
          additionalReviewerUserIds: additionalReviewerIds,
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

        <ParticipantPicker
          title="참조자"
          description="진행 상황을 공유할 멤버를 이름으로 고릅니다."
          members={memberOptions}
          options={referenceOptions}
          selectedValue={selectedReferenceId}
          onSelectedValueChange={setSelectedReferenceId}
          selectedIds={referenceIds}
          onAdd={(userId) => setReferenceIds((current) => (current.includes(userId) ? current : [...current, userId]))}
          onRemove={(userId) => setReferenceIds((current) => current.filter((id) => id !== userId))}
        />

        <ParticipantPicker
          title="추가 검토자"
          description="상신과 동시에 추가 검토자를 같이 지정할 수 있습니다."
          members={memberOptions}
          options={reviewerOptions}
          selectedValue={selectedReviewerId}
          onSelectedValueChange={setSelectedReviewerId}
          selectedIds={additionalReviewerIds}
          onAdd={(userId) =>
            setAdditionalReviewerIds((current) => (current.includes(userId) ? current : [...current, userId]))
          }
          onRemove={(userId) => setAdditionalReviewerIds((current) => current.filter((id) => id !== userId))}
        />

        <div className="rounded-[20px] border border-border/70 bg-muted/20 px-4 py-4 text-sm leading-6 text-muted-foreground">
          참조자 수 <span className="font-semibold text-foreground">{referenceIds.length}</span>
          <span className="mx-2 text-border">|</span>
          추가 검토자 수 <span className="font-semibold text-foreground">{additionalReviewerIds.length}</span>
          <span className="mx-2 text-border">|</span>
          첨부 presign API는 아직 연결되지 않아 상신 후 상세에서 첨부를 추가하는 흐름을 유지합니다.
        </div>
      </div>
    </AppModal>
  );
}

function ParticipantPicker({
  title,
  description,
  members,
  options,
  selectedValue,
  onSelectedValueChange,
  selectedIds,
  onAdd,
  onRemove,
}: {
  title: string;
  description: string;
  members: ProjectMember[];
  options: ProjectMember[];
  selectedValue: string;
  onSelectedValueChange: (value: string) => void;
  selectedIds: number[];
  onAdd: (userId: number) => void;
  onRemove: (userId: number) => void;
}) {
  return (
    <div className="space-y-3 rounded-[22px] border border-border/70 bg-background px-4 py-4">
      <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Users size={15} />
          {title}
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-2">
        <Select value={selectedValue} onValueChange={onSelectedValueChange} disabled={options.length === 0}>
          <SelectTrigger className="h-11 flex-1 rounded-xl bg-background shadow-none">
            <SelectValue placeholder={options.length === 0 ? '선택 가능한 멤버 없음' : '이름으로 멤버 선택'} />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {options.map((member) => (
              <SelectItem key={member.id} value={String(member.userId)}>
                {member.name} · {member.team}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          disabled={!selectedValue}
          onClick={() => {
            const userId = Number(selectedValue);
            if (!Number.isInteger(userId) || userId <= 0) return;
            onAdd(userId);
            onSelectedValueChange('');
          }}
        >
          추가
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedIds.length === 0 ? (
          <span className="text-xs text-muted-foreground">아직 선택된 멤버가 없습니다.</span>
        ) : (
          selectedIds.map((userId) => {
            const member = members.find((item) => item.userId === userId);
            const label = member ? `${member.name} · ${member.team}` : `멤버 #${userId}`;
            return (
              <button
                key={userId}
                type="button"
                onClick={() => onRemove(userId)}
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                <StatusPill tone="slate">{title}</StatusPill>
                {label}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
