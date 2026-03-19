import { useMemo, useState } from 'react';
import { Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import type { ReviewDetail } from '../types';
import type { ProjectMember } from '../../workspace/types';
import StatusPill from '../../../shared/ui/StatusPill';

type Props = {
  mode: 'create' | 'edit';
  initialReview?: ReviewDetail;
  onSubmit: (payload: {
    content: string;
    referenceUserIds: number[];
    additionalReviewerUserIds: number[];
    files: File[];
  }) => Promise<void>;
  submitting: boolean;
  memberOptions: ProjectMember[];
};

export default function ReviewForm({ mode, initialReview, onSubmit, submitting, memberOptions }: Props) {
  const [content, setContent] = useState(initialReview?.content ?? '');
  const [referenceIds, setReferenceIds] = useState<number[]>(
    initialReview?.references.map((reference) => reference.userId) ?? [],
  );
  const [additionalReviewerIds, setAdditionalReviewerIds] = useState<number[]>(
    initialReview?.additionalReviewers.map((reviewer) => reviewer.userId) ?? [],
  );
  const [selectedReferenceId, setSelectedReferenceId] = useState('');
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const referenceOptions = useMemo(
    () => memberOptions.filter((member) => !referenceIds.includes(member.userId) && !additionalReviewerIds.includes(member.userId)),
    [additionalReviewerIds, memberOptions, referenceIds],
  );
  const reviewerOptions = useMemo(
    () => memberOptions.filter((member) => !additionalReviewerIds.includes(member.userId) && !referenceIds.includes(member.userId)),
    [additionalReviewerIds, memberOptions, referenceIds],
  );

  return (
    <div className="space-y-6">
      <Card
        title={mode === 'create' ? '검토 상신 / 재상신' : '검토 수정'}
        description={
          mode === 'create'
            ? '업무 진행 중인 상태에서 새 검토를 상신합니다.'
            : '제출된 검토 본문을 수정합니다.'
        }
      >
        <div className="space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-gray-700">검토 본문</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={10}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
              placeholder="검토 요청 본문 또는 수정 내용을 입력하세요."
            />
          </label>

          <ParticipantSelect
            title="참조자"
            description="이름으로 골라 상신과 함께 연결합니다."
            members={memberOptions}
            options={referenceOptions}
            selectedValue={selectedReferenceId}
            onSelectedValueChange={setSelectedReferenceId}
            selectedIds={referenceIds}
            onAdd={(userId) => setReferenceIds((current) => (current.includes(userId) ? current : [...current, userId]))}
            onRemove={(userId) => setReferenceIds((current) => current.filter((id) => id !== userId))}
          />

          {mode === 'create' ? (
            <ParticipantSelect
              title="추가 검토자"
              description="초기 상신 시점에 같이 검토자로 지정합니다."
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
          ) : null}

          {mode === 'create' && (
            <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-5 text-sm text-gray-600">
              최신 백엔드 계약 기준으로 초기 첨부 presign API는 아직 없습니다. 상신 후 상세 화면에서 첨부를 추가하세요.
            </div>
          )}

          <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            참조자 수: <strong>{referenceIds.length}</strong>
            {mode === 'create' && (
              <>
                <span className="mx-2 text-gray-300">|</span>
                추가 검토자 수: <strong>{additionalReviewerIds.length}</strong>
              </>
            )}
            {initialReview && (
              <>
                <span className="mx-2 text-gray-300">|</span>
                현재 잠금 버전: <strong>v{initialReview.lockVersion}</strong>
              </>
            )}
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={() =>
            onSubmit({
              content,
              referenceUserIds: referenceIds,
              additionalReviewerUserIds: additionalReviewerIds,
              files: [],
            })
          }
          disabled={!content.trim() || submitting}
        >
          {mode === 'create' ? '상신하기' : '수정 저장'}
        </Button>
      </div>
    </div>
  );
}

function ParticipantSelect({
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
    <div className="space-y-3 rounded-2xl border border-gray-200 px-4 py-4">
      <div>
        <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Users size={15} />
          {title}
        </span>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <div className="flex gap-2">
        <Select value={selectedValue} onValueChange={onSelectedValueChange} disabled={options.length === 0}>
          <SelectTrigger className="h-11 flex-1 rounded-2xl border-gray-200 bg-white shadow-none">
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
          onClick={() => {
            const userId = Number(selectedValue);
            if (!Number.isInteger(userId) || userId <= 0) return;
            onAdd(userId);
            onSelectedValueChange('');
          }}
          disabled={!selectedValue}
        >
          추가
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedIds.length === 0 ? (
          <span className="text-xs text-gray-500">선택된 멤버가 없습니다.</span>
        ) : (
          selectedIds.map((userId) => {
            const member = members.find((item) => item.userId === userId);
            return (
              <button
                key={userId}
                type="button"
                onClick={() => onRemove(userId)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              >
                <StatusPill tone="slate">{title}</StatusPill>
                {member ? `${member.name} · ${member.team}` : `멤버 #${userId}`}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
