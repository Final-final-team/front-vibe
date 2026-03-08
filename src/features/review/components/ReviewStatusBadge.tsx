import type { ReviewStatus } from '../types';

const statusMap: Record<ReviewStatus, string> = {
  SUBMITTED: 'bg-amber-100 text-amber-800 border-amber-200',
  APPROVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  REJECTED: 'bg-rose-100 text-rose-700 border-rose-200',
  CANCELLED: 'bg-slate-100 text-slate-700 border-slate-200',
};

const labelMap: Record<ReviewStatus, string> = {
  SUBMITTED: '검토중',
  APPROVED: '승인됨',
  REJECTED: '반려됨',
  CANCELLED: '취소됨',
};

export default function ReviewStatusBadge({ status }: { status: ReviewStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusMap[status]}`}>
      {labelMap[status]}
    </span>
  );
}
