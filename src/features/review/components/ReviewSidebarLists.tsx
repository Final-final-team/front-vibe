import { useMemo, useState } from 'react';
import { Users2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import type { ProjectMember } from '../../workspace/types';
import type { AdditionalReviewerInfo, ReferenceInfo } from '../types';
import StatusPill from '../../../shared/ui/StatusPill';

type Props = {
  references: ReferenceInfo[];
  additionalReviewers: AdditionalReviewerInfo[];
  canManage: boolean;
  memberOptions: ProjectMember[];
  onAddReference: (userId: number) => Promise<void>;
  onRemoveReference: (userId: number) => Promise<void>;
  onAddAdditionalReviewer: (userId: number) => Promise<void>;
  onRemoveAdditionalReviewer: (userId: number) => Promise<void>;
};

export default function ReviewSidebarLists({
  references,
  additionalReviewers,
  canManage,
  memberOptions,
  onAddReference,
  onRemoveReference,
  onAddAdditionalReviewer,
  onRemoveAdditionalReviewer,
}: Props) {
  const [referenceInput, setReferenceInput] = useState('');
  const [reviewerInput, setReviewerInput] = useState('');
  const availableReferenceOptions = useMemo(
    () => memberOptions.filter((member) => !references.some((reference) => reference.userId === member.userId)),
    [memberOptions, references],
  );
  const availableReviewerOptions = useMemo(
    () => memberOptions.filter((member) => !additionalReviewers.some((reviewer) => reviewer.userId === member.userId)),
    [additionalReviewers, memberOptions],
  );

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-border/70 bg-[var(--surface-panel)] px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Reference</div>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">참조자</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">SUBMITTED 상태에서만 관리 가능합니다.</p>
          </div>
          <StatusPill tone="blue">{references.length}명</StatusPill>
        </div>
        <div className="mt-4 space-y-3">
          {references.length === 0 && <p className="text-sm text-slate-500">등록된 참조자가 없습니다.</p>}
          {references.map((reference) => (
            <ListRow
              key={reference.userId}
              label={resolveUserLabel(reference.userId, memberOptions)}
              meta={resolveActorLabel(reference.addedBy, memberOptions)}
              removable={canManage}
              onRemove={() => onRemoveReference(reference.userId)}
            />
          ))}
          <ManageInput
            value={referenceInput}
            onChange={setReferenceInput}
            options={availableReferenceOptions}
            buttonLabel="참조자 추가"
            selectLabel="참조자 지정"
            inputLabel="참조자 사용자 ID"
            disabled={!canManage}
            onSubmit={async () => {
              const userId = Number(referenceInput);

              if (!Number.isInteger(userId) || userId <= 0) {
                return;
              }

              await onAddReference(userId);
              setReferenceInput('');
            }}
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-border/70 bg-[var(--surface-panel)] px-5 py-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Additional Reviewer</div>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">추가 검토자</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">권한이 없는 승인자에게 review별 권한을 부여합니다.</p>
          </div>
          <StatusPill tone="purple">{additionalReviewers.length}명</StatusPill>
        </div>
        <div className="mt-4 space-y-3">
          {additionalReviewers.length === 0 && (
            <p className="text-sm text-slate-500">등록된 추가 검토자가 없습니다.</p>
          )}
          {additionalReviewers.map((reviewer) => (
            <ListRow
              key={reviewer.userId}
              label={resolveUserLabel(reviewer.userId, memberOptions)}
              meta={resolveActorLabel(reviewer.assignedBy, memberOptions)}
              removable={canManage}
              onRemove={() => onRemoveAdditionalReviewer(reviewer.userId)}
            />
          ))}
          <ManageInput
            value={reviewerInput}
            onChange={setReviewerInput}
            options={availableReviewerOptions}
            buttonLabel="추가 검토자 할당"
            selectLabel="추가 검토자 지정"
            inputLabel="추가 검토자 사용자 ID"
            disabled={!canManage}
            onSubmit={async () => {
              const userId = Number(reviewerInput);

              if (!Number.isInteger(userId) || userId <= 0) {
                return;
              }

              await onAddAdditionalReviewer(userId);
              setReviewerInput('');
            }}
          />
        </div>
      </section>
    </div>
  );
}

type ManageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  buttonLabel: string;
  disabled: boolean;
  options: ProjectMember[];
  selectLabel: string;
  inputLabel: string;
};

function ManageInput({
  value,
  onChange,
  onSubmit,
  buttonLabel,
  disabled,
  options,
  selectLabel,
  inputLabel,
}: ManageInputProps) {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-white/80 px-3 py-3 text-xs text-slate-500">
        <Users2 size={14} />
        프로젝트 멤버 기준으로 선택하거나, 사용자 ID를 직접 입력할 수 있습니다.
      </div>
      <div className="grid gap-3">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{selectLabel}</div>
          <Select value={value} onValueChange={onChange} disabled={disabled || options.length === 0}>
            <SelectTrigger aria-label={selectLabel} className="h-11 w-full rounded-xl bg-white/90 shadow-none">
              <SelectValue placeholder={options.length === 0 ? '선택 가능한 멤버 없음' : '프로젝트 멤버 선택'} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl">
              {options.map((member) => (
                <SelectItem key={member.id} value={String(member.userId)}>
                  {member.name} · {member.team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{inputLabel}</div>
          <Input
            aria-label={inputLabel}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            placeholder="또는 사용자 ID 직접 입력"
            className="h-11 rounded-xl bg-white/90"
          />
        </div>
      </div>
      <Button aria-label={buttonLabel} variant="outline" className="w-full rounded-xl" onClick={() => void onSubmit()} disabled={disabled}>
        {buttonLabel}
      </Button>
    </div>
  );
}

function resolveUserLabel(userId: number, options: ProjectMember[]) {
  const member = options.find((item) => item.userId === userId);
  if (!member) {
    return `User #${userId}`;
  }

  return `${member.name} · ${member.team}`;
}

function resolveActorLabel(userId: number, options: ProjectMember[]) {
  const member = options.find((item) => item.userId === userId);
  if (!member) {
    return `by #${userId}`;
  }

  return `assigned by ${member.name}`;
}

type ListRowProps = {
  label: string;
  meta: string;
  removable: boolean;
  onRemove: () => Promise<void>;
};

function ListRow({ label, meta, removable, onRemove }: ListRowProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-white/80 px-4 py-4">
      <div>
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        <div className="text-xs text-slate-500">{meta}</div>
      </div>
      {removable && (
        <Button variant="ghost" size="sm" className="rounded-lg px-3" onClick={() => void onRemove()}>
          제거
        </Button>
      )}
    </div>
  );
}
