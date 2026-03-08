import { useState } from 'react';
import Button from '../../../shared/ui/Button';
import Card from '../../../shared/ui/Card';
import type { AdditionalReviewerInfo, ReferenceInfo } from '../types';

type Props = {
  references: ReferenceInfo[];
  additionalReviewers: AdditionalReviewerInfo[];
  canManage: boolean;
  onAddReference: (userId: number) => Promise<void>;
  onRemoveReference: (userId: number) => Promise<void>;
  onAddAdditionalReviewer: (userId: number) => Promise<void>;
  onRemoveAdditionalReviewer: (userId: number) => Promise<void>;
};

export default function ReviewSidebarLists({
  references,
  additionalReviewers,
  canManage,
  onAddReference,
  onRemoveReference,
  onAddAdditionalReviewer,
  onRemoveAdditionalReviewer,
}: Props) {
  const [referenceInput, setReferenceInput] = useState('');
  const [reviewerInput, setReviewerInput] = useState('');

  return (
    <div className="space-y-5">
      <Card title="참조자" description="SUBMITTED 상태에서만 관리 가능합니다.">
        <div className="space-y-3">
          {references.length === 0 && <p className="text-sm text-gray-500">등록된 참조자가 없습니다.</p>}
          {references.map((reference) => (
            <ListRow
              key={reference.userId}
              label={`User #${reference.userId}`}
              meta={`added by #${reference.addedBy}`}
              removable={canManage}
              onRemove={() => onRemoveReference(reference.userId)}
            />
          ))}
          <ManageInput
            value={referenceInput}
            onChange={setReferenceInput}
            buttonLabel="참조자 추가"
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
      </Card>

      <Card title="추가 검토자" description="권한이 없는 승인자에게 review별 권한을 부여합니다.">
        <div className="space-y-3">
          {additionalReviewers.length === 0 && (
            <p className="text-sm text-gray-500">등록된 추가 검토자가 없습니다.</p>
          )}
          {additionalReviewers.map((reviewer) => (
            <ListRow
              key={reviewer.userId}
              label={`User #${reviewer.userId}`}
              meta={`assigned by #${reviewer.assignedBy}`}
              removable={canManage}
              onRemove={() => onRemoveAdditionalReviewer(reviewer.userId)}
            />
          ))}
          <ManageInput
            value={reviewerInput}
            onChange={setReviewerInput}
            buttonLabel="추가 검토자 할당"
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
      </Card>
    </div>
  );
}

type ManageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => Promise<void>;
  buttonLabel: string;
  disabled: boolean;
};

function ManageInput({ value, onChange, onSubmit, buttonLabel, disabled }: ManageInputProps) {
  return (
    <div className="pt-2">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder="사용자 ID"
          className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:bg-gray-50"
        />
        <Button variant="secondary" onClick={() => void onSubmit()} disabled={disabled}>
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}

type ListRowProps = {
  label: string;
  meta: string;
  removable: boolean;
  onRemove: () => Promise<void>;
};

function ListRow({ label, meta, removable, onRemove }: ListRowProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-3">
      <div>
        <div className="text-sm font-semibold text-gray-800">{label}</div>
        <div className="text-xs text-gray-500">{meta}</div>
      </div>
      {removable && (
        <Button variant="ghost" className="px-3 py-1.5" onClick={() => void onRemove()}>
          제거
        </Button>
      )}
    </div>
  );
}
