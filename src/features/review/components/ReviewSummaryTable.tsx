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
      title="검토 라운드"
      description="업무 단위의 검토 라운드와 잠금 버전을 정리해서 보여줍니다."
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              <th className="border-b border-border/70 pb-3 pr-4">Round</th>
              <th className="border-b border-border/70 px-4 pb-3">Status</th>
              <th className="border-b border-border/70 px-4 pb-3">Submitted</th>
              <th className="border-b border-border/70 px-4 pb-3">Decided</th>
              <th className="border-b border-border/70 px-4 pb-3">Lock</th>
              <th className="border-b border-border/70 px-4 pb-3 text-right">Go</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.reviewId} className="text-sm text-foreground">
                <td className="border-b border-border/70 py-4 pr-4 font-semibold">#{review.roundNo}</td>
                <td className="border-b border-border/70 px-4 py-4">
                  <ReviewStatusBadge status={review.status} />
                </td>
                <td className="border-b border-border/70 px-4 py-4 text-muted-foreground">{formatDate(review.submittedAt)}</td>
                <td className="border-b border-border/70 px-4 py-4 text-muted-foreground">{formatDate(review.decidedAt)}</td>
                <td className="border-b border-border/70 px-4 py-4 text-muted-foreground">v{review.lockVersion}</td>
                <td className="border-b border-border/70 px-4 py-4 text-right">
                  <Link
                    to={`/reviews/${review.reviewId}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80"
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
