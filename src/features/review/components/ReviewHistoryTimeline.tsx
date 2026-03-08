import Card from '../../../shared/ui/Card';
import { formatDate } from '../../../shared/lib/format';
import type { ReviewHistoryItem } from '../types';

type Props = {
  items: ReviewHistoryItem[];
};

export default function ReviewHistoryTimeline({ items }: Props) {
  return (
    <Card title="히스토리" description="가장 최신 액션부터 표시합니다.">
      <div className="space-y-4">
        {items.length === 0 && <p className="text-sm text-gray-500">기록된 히스토리가 없습니다.</p>}
        {items.map((item) => (
          <div key={item.historyId} className="relative pl-6">
            <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-blue-500" />
            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-semibold text-gray-800">{item.actionType}</div>
                <div className="text-xs text-gray-500">{formatDate(item.occurredAt)}</div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                대상: {item.targetType} #{item.targetId} · 처리자 #{item.actorId}
              </div>
              {item.reason && <div className="mt-1 text-sm text-rose-700">사유: {item.reason}</div>}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
