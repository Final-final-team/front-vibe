import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../../../shared/ui/Card';
import { formatDate } from '../../../shared/lib/format';
import type { ReviewSummary } from '../types';
import ReviewStatusBadge from './ReviewStatusBadge';

type Props = {
  reviews: ReviewSummary[];
};

export default function ReviewSummaryTable({ reviews }: Props) {
  return (
    <Card
      title="Review Rounds"
      description="업무 단위의 review 라운드와 상태를 확인합니다."
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
              <th className="border-b border-gray-100 pb-3 pr-4">Round</th>
              <th className="border-b border-gray-100 px-4 pb-3">Status</th>
              <th className="border-b border-gray-100 px-4 pb-3">Submitted</th>
              <th className="border-b border-gray-100 px-4 pb-3">Decided</th>
              <th className="border-b border-gray-100 px-4 pb-3">Lock</th>
              <th className="border-b border-gray-100 px-4 pb-3 text-right">Go</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.reviewId} className="text-sm text-gray-700">
                <td className="border-b border-gray-100 py-4 pr-4 font-semibold">#{review.roundNo}</td>
                <td className="border-b border-gray-100 px-4 py-4">
                  <ReviewStatusBadge status={review.status} />
                </td>
                <td className="border-b border-gray-100 px-4 py-4">{formatDate(review.submittedAt)}</td>
                <td className="border-b border-gray-100 px-4 py-4">{formatDate(review.decidedAt)}</td>
                <td className="border-b border-gray-100 px-4 py-4">v{review.lockVersion}</td>
                <td className="border-b border-gray-100 px-4 py-4 text-right">
                  <Link
                    to={`/reviews/${review.reviewId}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    상세
                    <ArrowRight size={15} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
