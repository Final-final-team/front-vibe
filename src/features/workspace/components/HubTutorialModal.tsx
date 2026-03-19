import { ArrowRight, CheckCircle2, FolderKanban, MessagesSquare, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import AppModal from '../../../shared/ui/AppModal';
import BrandLockup from '../../../shared/ui/BrandLockup';
import hubReal from '../../../assets/tutorial/hub-real.png';
import tasksReal from '../../../assets/tutorial/tasks-real.png';
import reviewsReal from '../../../assets/tutorial/reviews-real.png';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
};

const steps = [
  {
    id: 'project',
    title: '먼저 오늘 들어갈 프로젝트를 고릅니다',
    description: '카드에서 가장 급한 프로젝트를 열면 바로 업무와 검토 흐름으로 이어집니다.',
    icon: <FolderKanban size={16} />,
  },
  {
    id: 'task',
    title: '업무에서 담당과 상신을 바로 처리합니다',
    description: '업무 상세를 열지 않아도 담당 지정과 검토 상신까지 빠르게 이어갈 수 있습니다.',
    icon: <Users size={16} />,
  },
  {
    id: 'review',
    title: '검토함에서는 내가 처리할 건만 빠르게 봅니다',
    description: '내 검토 기준으로 먼저 열리기 때문에 지금 처리할 라운드만 바로 골라서 확인할 수 있습니다.',
    icon: <MessagesSquare size={16} />,
  },
] as const;

export default function HubTutorialModal({ open, onOpenChange, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const step = steps[index] ?? steps[0];
  const isLast = index === steps.length - 1;

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={step.title}
      description={step.description}
      size="xl"
      badges={
        <>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
            처음 사용하는 분들을 위한 시작 안내
          </div>
          <div className="rounded-full border border-lime-200 bg-lime-50 px-3 py-1 text-xs font-semibold text-lime-700">
            {index + 1} / {steps.length}
          </div>
        </>
      }
      footer={
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {steps.map((item, stepIndex) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(stepIndex)}
                className={[
                  'h-2.5 rounded-full transition-all',
                  stepIndex === index ? 'w-8 bg-slate-950' : 'w-2.5 bg-slate-300 hover:bg-slate-400',
                ].join(' ')}
                aria-label={`${stepIndex + 1}단계`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
              <Button type="button" variant="outline" className="rounded-xl px-4" onClick={onComplete}>
                다시 보지 않기
              </Button>
            {!isLast ? (
              <Button type="button" className="rounded-xl px-4" onClick={() => setIndex((current) => Math.min(current + 1, steps.length - 1))}>
                다음
                <ArrowRight size={15} />
              </Button>
            ) : (
              <Button type="button" className="rounded-xl px-4" onClick={onComplete}>
                시작하기
                <CheckCircle2 size={15} />
              </Button>
            )}
          </div>
        </div>
      }
      bodyClassName="px-5 py-5 sm:px-6 sm:py-6"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <BrandLockup caption="HEY-A-JI GUIDE" />
          <div className="flex items-center gap-2">
            {steps.map((item, stepIndex) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndex(stepIndex)}
                className={[
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  stepIndex === index
                    ? 'bg-slate-950 text-white'
                    : 'border border-border/70 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900',
                ].join(' ')}
              >
                {stepIndex + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          {index === 0 ? <HubPreviewFrame /> : null}
          {index === 1 ? <TaskPreviewFrame /> : null}
          {index === 2 ? <ReviewPreviewFrame /> : null}
        </div>
      </div>
    </AppModal>
  );
}

function HubPreviewFrame() {
  return (
    <ActualPreview
      image={hubReal}
      alt="프로젝트 허브 실제 화면"
      title="프로젝트를 고르면 바로 시작됩니다"
      body="가장 급한 프로젝트부터 열면 업무와 검토가 바로 이어집니다."
      action="프로젝트 열기"
    />
  );
}

function TaskPreviewFrame() {
  return (
    <ActualPreview
      image={tasksReal}
      alt="업무 보드 실제 화면"
      title="업무 안에서 바로 처리합니다"
      body="담당 지정과 검토 상신은 같은 화면에서 바로 이어집니다."
      action="상신 버튼 보기"
    />
  );
}

function ReviewPreviewFrame() {
  return (
    <ActualPreview
      image={reviewsReal}
      alt="검토함 실제 화면"
      title="내 차례 검토부터 봅니다"
      body="지금 처리해야 할 검토를 먼저 보고 바로 승인·반려 흐름으로 이어집니다."
      action="내 검토 확인"
    />
  );
}

function ActualPreview({
  image,
  alt,
  title,
  body,
  action,
}: {
  image: string;
  alt: string;
  title: string;
  body: string;
  action: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
      <img src={image} alt={alt} className="block h-auto w-full" />
      <div className="absolute right-4 top-4">
        <FloatingGuideCard title={title} body={body} action={action} />
      </div>
    </div>
  );
}

function FloatingGuideCard({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: string;
}) {
  return (
    <div className="w-[220px] rounded-[18px] border border-slate-200 bg-white/98 px-3.5 py-3.5 shadow-[0_20px_48px_rgba(15,23,42,0.16)] backdrop-blur">
      <div className="text-sm font-semibold text-slate-950">{title}</div>
      <div className="mt-2 text-[12px] leading-5 text-slate-600">{body}</div>
      <div className="mt-3 rounded-xl bg-slate-950 px-3 py-2 text-[11px] font-semibold text-white">{action}</div>
    </div>
  );
}
