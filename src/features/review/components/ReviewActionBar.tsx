import { Check, Pencil, RotateCcw, SendHorizontal, UserPlus, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../../shared/ui/Button';
import type { ReviewStatus } from '../types';

type Props = {
  taskId: number;
  reviewId: number;
  status: ReviewStatus;
  canEdit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canCancel: boolean;
  canResubmit: boolean;
  onApprove: () => void;
  onReject: () => void;
  onCancel: () => void;
};

export default function ReviewActionBar({
  taskId,
  reviewId,
  status,
  canEdit,
  canApprove,
  canReject,
  canCancel,
  canResubmit,
  onApprove,
  onReject,
  onCancel,
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {canEdit && (
        <Link to={`/reviews/${reviewId}/edit`}>
          <Button variant="secondary" icon={<Pencil size={16} />}>
            본문 수정
          </Button>
        </Link>
      )}
      {canApprove && (
        <Button icon={<Check size={16} />} onClick={onApprove}>
          승인
        </Button>
      )}
      {canReject && (
        <Button variant="danger" icon={<XCircle size={16} />} onClick={onReject}>
          반려
        </Button>
      )}
      {canCancel && (
        <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={onCancel}>
          취소
        </Button>
      )}
      {canResubmit && status !== 'SUBMITTED' && (
        <Link to={`/tasks/${taskId}/reviews/new`}>
          <Button variant="secondary" icon={<SendHorizontal size={16} />}>
            재상신
          </Button>
        </Link>
      )}
      {!canEdit && !canApprove && !canReject && !canCancel && !canResubmit && (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-2 text-sm text-gray-500">
          현재 상태 또는 권한으로 수행 가능한 액션이 없습니다.
        </div>
      )}
      <div className="ml-auto inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-700">
        <UserPlus size={15} />
        권한이 맞지 않는 액션은 선제 차단됩니다.
      </div>
    </div>
  );
}
