type Tone = 'current' | 'future' | 'candidate' | 'shell' | 'flow';

type FrameCard = {
  title: string;
  route: string;
  tone: Tone;
  x: number;
  y: number;
  width: number;
  height: number;
  sectionTitle?: string;
  footer?: string;
  chips?: string[];
  bullets: string[];
  layout: 'shell' | 'list' | 'board' | 'detail' | 'split' | 'modal' | 'kanban' | 'calendar' | 'chart' | 'gantt';
};

type Sticky = {
  x: number;
  y: number;
  width: number;
  text: string[];
  tone?: 'yellow' | 'mint' | 'peach';
};

type Diamond = {
  x: number;
  y: number;
  text: string;
};

const frameCards: FrameCard[] = [
  {
    title: '워크스페이스 셸',
    route: 'shared-shell',
    tone: 'shell',
    x: 170,
    y: 180,
    width: 980,
    height: 560,
    sectionTitle: '공통 셸',
    footer: '프로젝트 컨텍스트 + 도메인 탭 + 뷰 탭 + 툴바',
    chips: ['현재 확정', '공통'],
    bullets: ['프로젝트 선택', '멤버/역할·권한/마일스톤/업무/검토', '테이블 활성, 나머지 뷰 비활성', '검색/필터/정렬'],
    layout: 'shell',
  },
  {
    title: '업무 보드',
    route: '/tasks',
    tone: 'current',
    x: 350,
    y: 950,
    width: 860,
    height: 620,
    sectionTitle: '핵심 운영',
    footer: '드래그앤드롭 우선 적용 영역',
    chips: ['현재 확정'],
    bullets: ['마일스톤 그룹', '업무 row', '상태/담당자/기한', '검토 진입 버튼'],
    layout: 'board',
  },
  {
    title: '업무 상세 패널',
    route: 'task-detail',
    tone: 'current',
    x: 1330,
    y: 870,
    width: 460,
    height: 730,
    footer: '업무에서 검토로 넘어가는 연결 지점',
    chips: ['현재 확정', '패널'],
    bullets: ['메타 정보', '담당자', '활동 로그', '검토 상신 CTA'],
    layout: 'detail',
  },
  {
    title: '검토 Inbox',
    route: '/reviews',
    tone: 'current',
    x: 2320,
    y: 240,
    width: 640,
    height: 560,
    sectionTitle: '검토 흐름',
    footer: '프로젝트 review 큐 집합',
    chips: ['현재 확정'],
    bullets: ['큐 리스트', '상태 배지', '최근 라운드', '검토 흐름 안내'],
    layout: 'list',
  },
  {
    title: '검토 상세',
    route: '/reviews/:reviewId',
    tone: 'current',
    x: 2260,
    y: 920,
    width: 760,
    height: 700,
    footer: '승인/반려 중심 화면',
    chips: ['현재 확정'],
    bullets: ['본문', '상태/메타', '첨부/코멘트', '히스토리/액션'],
    layout: 'split',
  },
  {
    title: '검토 상신 / 수정',
    route: '/tasks/:taskId/reviews/new',
    tone: 'current',
    x: 3110,
    y: 1060,
    width: 470,
    height: 470,
    sectionTitle: '폼 흐름',
    footer: '상신과 수정이 같은 폼 구조 공유',
    chips: ['현재 확정'],
    bullets: ['본문 입력', '참조자/추가 검토자', '첨부', '확인/취소 CTA'],
    layout: 'modal',
  },
  {
    title: '멤버',
    route: '/members',
    tone: 'current',
    x: 150,
    y: 1920,
    width: 430,
    height: 500,
    sectionTitle: '지원 도메인',
    footer: '초대 기반 온보딩',
    chips: ['현재 확정'],
    bullets: ['멤버 목록', '초대 상태', '역할 연결', '초대 모달 후보'],
    layout: 'list',
  },
  {
    title: '역할 / 권한',
    route: '/roles',
    tone: 'current',
    x: 640,
    y: 1920,
    width: 500,
    height: 500,
    footer: '프로젝트 단위 RBAC',
    chips: ['현재 확정'],
    bullets: ['역할 리스트', '권한 매트릭스', '멤버 할당', '정책 미확정'],
    layout: 'split',
  },
  {
    title: '마일스톤',
    route: '/milestones',
    tone: 'current',
    x: 1200,
    y: 1920,
    width: 500,
    height: 500,
    footer: '집계형 목표 관리',
    chips: ['현재 확정'],
    bullets: ['마일스톤 카드', '진척도', '연결 업무 수', '지연/완료 요약'],
    layout: 'chart',
  },
  {
    title: '칸반',
    route: 'future-view',
    tone: 'future',
    x: 1880,
    y: 1840,
    width: 430,
    height: 500,
    sectionTitle: '미래 뷰 확장',
    footer: '같은 업무 데이터의 다른 표현',
    chips: ['후속 확장'],
    bullets: ['컬럼 이동 DnD', '상태 중심', '빠른 이동'],
    layout: 'kanban',
  },
  {
    title: '캘린더',
    route: 'future-view',
    tone: 'future',
    x: 2370,
    y: 1840,
    width: 430,
    height: 500,
    footer: '기한/일정 기반',
    chips: ['후속 확장'],
    bullets: ['월간 뷰', '업무 배치', '리마인더 후보'],
    layout: 'calendar',
  },
  {
    title: '차트',
    route: 'future-view',
    tone: 'future',
    x: 2860,
    y: 1840,
    width: 430,
    height: 500,
    footer: '마일스톤/업무 집계 시각화',
    chips: ['후속 확장'],
    bullets: ['병목 시각화', '진척도 카드', '팀 현황'],
    layout: 'chart',
  },
  {
    title: '간트',
    route: 'future-view',
    tone: 'future',
    x: 3350,
    y: 1840,
    width: 430,
    height: 500,
    footer: '타임라인 + 의존성',
    chips: ['후속 확장'],
    bullets: ['기간 조정', '마일스톤 기준', '의존성'],
    layout: 'gantt',
  },
  {
    title: '멤버 초대 모달',
    route: 'overlay',
    tone: 'candidate',
    x: 1940,
    y: 2520,
    width: 340,
    height: 300,
    sectionTitle: '오버레이 후보',
    chips: ['미확정 인터랙션'],
    bullets: ['이메일', '초기 역할', '전송 CTA'],
    layout: 'modal',
  },
  {
    title: '역할 생성 / 수정',
    route: 'overlay',
    tone: 'candidate',
    x: 2340,
    y: 2520,
    width: 340,
    height: 300,
    chips: ['미확정 인터랙션'],
    bullets: ['역할명', '권한 묶음', '저장'],
    layout: 'modal',
  },
  {
    title: '검토 처리 모달',
    route: 'overlay',
    tone: 'candidate',
    x: 2740,
    y: 2520,
    width: 340,
    height: 300,
    chips: ['미확정 인터랙션'],
    bullets: ['승인/반려', '코멘트', '확인 CTA'],
    layout: 'modal',
  },
];

const stickies: Sticky[] = [
  {
    x: 870,
    y: 220,
    width: 250,
    tone: 'yellow',
    text: ['공통 셸', '프로젝트는 상위 컨텍스트', '현재는 테이블만 활성', '칸반/캘린더/차트/간트는 후속'],
  },
  {
    x: 1460,
    y: 1240,
    width: 250,
    tone: 'mint',
    text: ['업무 중심 축', 'D&D는 업무 테이블 우선', '업무 상세에서 검토로 진입', '서버 저장 방식은 아직 미정'],
  },
  {
    x: 2860,
    y: 260,
    width: 250,
    tone: 'peach',
    text: ['검토는 독립 엔터티 아님', '업무 하위 프로세스', 'Inbox는 큐 관점', '상세는 승인/반려 관점'],
  },
  {
    x: 420,
    y: 2480,
    width: 280,
    tone: 'yellow',
    text: ['지원 도메인', '멤버/역할·권한/마일스톤은 관리형 화면', '업무/검토는 흐름형 화면', '확정성 태그를 꼭 분리'],
  },
  {
    x: 3380,
    y: 2440,
    width: 300,
    tone: 'mint',
    text: ['기술 메모', '실연동은 업무 데이터 준비 후 강화', 'Vercel env에는 공개 가능한 값만', 'mock/live 모드 명시'],
  },
];

const diamonds: Diamond[] = [
  { x: 1980, y: 610, text: '업무에서\n검토 진입' },
  { x: 2100, y: 1700, text: '같은 데이터\n다른 뷰' },
  { x: 3200, y: 1620, text: '폼 완료 후\n상세 확인' },
];

const connectors = [
  { x1: 640, y1: 760, x2: 780, y2: 940, label: '공통 탐색 구조' },
  { x1: 1210, y1: 1250, x2: 1330, y2: 1230, label: 'row 선택' },
  { x1: 1790, y1: 1230, x2: 2250, y2: 1230, label: '검토 생성 / 상세 연결' },
  { x1: 2640, y1: 800, x2: 2640, y2: 915, label: '큐에서 상세 진입' },
  { x1: 2960, y1: 1260, x2: 3110, y2: 1260, label: '상신 / 수정' },
  { x1: 1690, y1: 2140, x2: 1880, y2: 2060, label: '같은 업무 데이터' },
  { x1: 1450, y1: 2140, x2: 2860, y2: 2060, label: '집계 / 시각화 확장' },
  { x1: 560, y1: 2420, x2: 1940, y2: 2660, label: '모달 / 패널 후보' },
];

export default function WireframesBoardPage() {
  return (
    <div className="min-h-screen overflow-auto bg-[#ddd8d0] p-10 text-slate-900">
      <div
        className="relative mx-auto overflow-hidden rounded-[36px] border border-[#cbc3b6] bg-[#f3efe8] shadow-[0_30px_100px_rgba(59,45,24,0.16)]"
        style={{
          width: 4040,
          height: 3000,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.2) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      >
        <header className="absolute left-12 top-10 z-20 flex items-center gap-4">
          <div className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white">front-vibe 화면설계서 v1</div>
          <div className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-600">
            현재 프론트 구현 기준 / 업무-검토 중심 / 미래 뷰 확장 고려
          </div>
        </header>

        <Legend />
        <SectionBackdrop title="공통 셸" x={110} y={130} width={1080} height={700} />
        <SectionBackdrop title="핵심 운영" x={280} y={860} width={1560} height={820} />
        <SectionBackdrop title="검토 흐름" x={2220} y={170} width={1460} height={1510} />
        <SectionBackdrop title="지원 도메인" x={110} y={1830} width={1640} height={730} />
        <SectionBackdrop title="미래 뷰 확장" x={1830} y={1750} width={2020} height={690} />
        <SectionBackdrop title="오버레이 후보" x={1880} y={2440} width={1270} height={420} />

        <svg className="absolute inset-0 h-full w-full">
          {connectors.map((connector) => (
            <ConnectorPath key={connector.label} {...connector} />
          ))}
        </svg>

        {diamonds.map((diamond) => (
          <FlowDiamond key={`${diamond.x}-${diamond.y}`} {...diamond} />
        ))}

        {stickies.map((sticky) => (
          <StickyNote key={`${sticky.x}-${sticky.y}`} {...sticky} />
        ))}

        {frameCards.map((card) => (
          <ScreenCard key={`${card.title}-${card.route}`} {...card} />
        ))}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="absolute right-16 top-16 z-20 rounded-[24px] border border-slate-300 bg-white/90 px-5 py-4 shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">확정성 범례</div>
      <div className="mt-3 flex gap-2">
        <LegendPill tone="current">현재 확정</LegendPill>
        <LegendPill tone="future">후속 확장</LegendPill>
        <LegendPill tone="candidate">미확정 인터랙션</LegendPill>
      </div>
    </div>
  );
}

function LegendPill({ tone, children }: { tone: Tone; children: string }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneStyles[tone].pill}`}>{children}</span>;
}

function SectionBackdrop({
  title,
  x,
  y,
  width,
  height,
}: {
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  return (
    <div
      className="absolute rounded-[34px] border-2 border-dashed border-slate-300/80 bg-white/45"
      style={{ left: x, top: y, width, height }}
    >
      <div className="absolute -top-5 left-6 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">{title}</div>
    </div>
  );
}

function ScreenCard(card: FrameCard) {
  const tone = toneStyles[card.tone];

  return (
    <article
      className={`absolute rounded-[28px] border bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.10)] ${tone.border}`}
      style={{ left: card.x, top: card.y, width: card.width, height: card.height }}
    >
      {card.sectionTitle ? (
        <div className={`absolute -top-5 left-5 rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm ${tone.sectionTag}`}>
          {card.sectionTitle}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {card.chips?.map((chip) => (
            <span key={chip} className={`rounded-full px-3 py-1 text-[11px] font-semibold ${tone.pill}`}>
              {chip}
            </span>
          ))}
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{card.route}</span>
      </div>

      <h3 className="mt-4 text-[32px] font-bold tracking-tight text-slate-950">{card.title}</h3>

      <div className="mt-4 rounded-[24px] border border-slate-200 bg-[#fcfcfd] p-4">
        <MiniScreen layout={card.layout} />
      </div>

      <div className="mt-4 space-y-2">
        {card.bullets.map((bullet) => (
          <div key={bullet} className="rounded-2xl bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700">
            {bullet}
          </div>
        ))}
      </div>

      {card.footer ? <div className="mt-4 text-sm font-medium text-slate-500">{card.footer}</div> : null}
    </article>
  );
}

function MiniScreen({ layout }: { layout: FrameCard['layout'] }) {
  if (layout === 'shell') {
    return (
      <div className="rounded-[22px] border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="h-8 w-40 rounded-xl bg-slate-100" />
          <div className="h-8 w-36 rounded-xl bg-slate-100" />
        </div>
        <div className="mt-3 flex gap-2 border-b border-slate-200 pb-3">
          <TabStub active>멤버</TabStub>
          <TabStub>역할 / 권한</TabStub>
          <TabStub>마일스톤</TabStub>
          <TabStub>업무</TabStub>
          <TabStub>검토</TabStub>
        </div>
        <div className="mt-3 flex gap-2 border-b border-slate-200 pb-3">
          <GhostPill active>테이블</GhostPill>
          <GhostPill>칸반</GhostPill>
          <GhostPill>캘린더</GhostPill>
          <GhostPill>차트</GhostPill>
          <GhostPill>간트</GhostPill>
        </div>
        <div className="mt-3 flex gap-2">
          <div className="h-9 flex-1 rounded-xl bg-slate-100" />
          <div className="h-9 w-24 rounded-xl bg-slate-100" />
          <div className="h-9 w-24 rounded-xl bg-slate-100" />
          <div className="h-9 w-24 rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (layout === 'board') {
    return (
      <div className="rounded-[22px] border border-slate-200 bg-white p-4">
        <div className="flex gap-2">
          <div className="h-8 w-32 rounded-xl bg-slate-100" />
          <div className="h-8 w-24 rounded-xl bg-slate-100" />
        </div>
        <div className="mt-3 space-y-3">
          {[1, 2, 3].map((group) => (
            <div key={group} className="rounded-[18px] border border-slate-200 p-3">
              <div className="h-6 w-40 rounded-lg bg-slate-100" />
              <div className="mt-3 grid grid-cols-[1.6fr_0.9fr_0.9fr_0.9fr] gap-2">
                {['업무', '상태', '담당자', '기한'].map((label) => (
                  <div key={label} className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    {label}
                  </div>
                ))}
              </div>
              {[1, 2].map((row) => (
                <div key={row} className="mt-2 grid grid-cols-[1.6fr_0.9fr_0.9fr_0.9fr] gap-2">
                  <div className="h-11 rounded-xl bg-slate-100" />
                  <div className="h-11 rounded-xl bg-emerald-50" />
                  <div className="h-11 rounded-xl bg-slate-100" />
                  <div className="h-11 rounded-xl bg-slate-100" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'detail') {
    return (
      <div className="rounded-[22px] border border-slate-200 bg-white p-4">
        <div className="h-10 rounded-xl bg-slate-100" />
        <div className="mt-3 h-28 rounded-[18px] bg-slate-100" />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="h-24 rounded-[18px] bg-slate-100" />
          <div className="h-24 rounded-[18px] bg-slate-100" />
        </div>
        <div className="mt-3 h-44 rounded-[22px] border border-slate-200 bg-white" />
        <div className="mt-3 flex gap-2">
          <div className="h-10 flex-1 rounded-xl bg-indigo-100" />
          <div className="h-10 w-24 rounded-xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (layout === 'split') {
    return (
      <div className="grid gap-3 md:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
          <div className="h-10 rounded-xl bg-slate-100" />
          <div className="mt-3 h-16 rounded-[18px] bg-slate-100" />
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="h-24 rounded-[18px] bg-slate-100" />
            <div className="h-24 rounded-[18px] bg-slate-100" />
            <div className="h-24 rounded-[18px] bg-slate-100" />
          </div>
          <div className="mt-3 h-40 rounded-[22px] border border-slate-200 bg-white" />
        </div>
        <div className="rounded-[22px] border border-slate-200 bg-white p-4">
          <div className="space-y-3">
            <div className="h-14 rounded-[18px] bg-slate-100" />
            <div className="h-14 rounded-[18px] bg-slate-100" />
            <div className="h-14 rounded-[18px] bg-slate-100" />
            <div className="h-14 rounded-[18px] bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'list') {
    return (
      <div className="rounded-[22px] border border-slate-200 bg-white p-4">
        <div className="h-10 rounded-xl bg-slate-100" />
        <div className="mt-3 space-y-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="rounded-[18px] border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <div className="h-6 w-40 rounded-lg bg-slate-100" />
                <div className="h-6 w-20 rounded-full bg-slate-100" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="h-8 rounded-lg bg-slate-100" />
                <div className="h-8 rounded-lg bg-slate-100" />
                <div className="h-8 rounded-lg bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'modal') {
    return (
      <div className="flex h-full items-center justify-center rounded-[22px] border border-slate-200 bg-[#f7f7fb] p-6">
        <div className="w-full max-w-[280px] rounded-[22px] border border-violet-200 bg-white p-4 shadow-[0_12px_24px_rgba(76,29,149,0.12)]">
          <div className="h-8 rounded-xl bg-slate-100" />
          <div className="mt-3 h-10 rounded-xl bg-slate-100" />
          <div className="mt-3 h-10 rounded-xl bg-slate-100" />
          <div className="mt-3 h-24 rounded-[18px] bg-slate-100" />
          <div className="mt-3 flex gap-2">
            <div className="h-10 flex-1 rounded-xl bg-slate-100" />
            <div className="h-10 flex-1 rounded-xl bg-violet-100" />
          </div>
        </div>
      </div>
    );
  }

  if (layout === 'kanban') {
    return (
      <div className="grid h-full grid-cols-3 gap-3">
        {[1, 2, 3].map((column) => (
          <div key={column} className="rounded-[20px] border border-slate-200 bg-white p-3">
            <div className="h-7 rounded-lg bg-slate-100" />
            <div className="mt-3 space-y-3">
              {[1, 2, 3].map((card) => (
                <div key={card} className="rounded-[16px] border border-slate-200 bg-slate-50 p-3">
                  <div className="h-5 rounded-lg bg-slate-100" />
                  <div className="mt-2 h-4 w-20 rounded-lg bg-slate-100" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (layout === 'calendar') {
    return (
      <div className="rounded-[22px] border border-slate-200 bg-white p-4">
        <div className="h-8 rounded-xl bg-slate-100" />
        <div className="mt-3 grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, index) => (
            <div key={index} className="h-16 rounded-xl border border-slate-200 bg-slate-50" />
          ))}
        </div>
      </div>
    );
  }

  if (layout === 'chart') {
    return (
      <div className="rounded-[22px] border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 rounded-[18px] bg-slate-100" />
          <div className="h-24 rounded-[18px] bg-slate-100" />
          <div className="col-span-2 rounded-[20px] border border-slate-200 p-4">
            <div className="flex h-36 items-end gap-3">
              <div className="h-16 w-12 rounded-t-xl bg-emerald-200" />
              <div className="h-24 w-12 rounded-t-xl bg-emerald-300" />
              <div className="h-20 w-12 rounded-t-xl bg-emerald-400" />
              <div className="h-32 w-12 rounded-t-xl bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-4">
      <div className="h-8 rounded-xl bg-slate-100" />
      <div className="mt-3 h-44 rounded-[18px] border border-slate-200 bg-white p-4">
        <div className="space-y-3">
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="grid grid-cols-[100px_1fr] gap-3">
              <div className="h-6 rounded-lg bg-slate-100" />
              <div className="h-6 rounded-lg bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TabStub({ children, active }: { children: string; active?: boolean }) {
  return (
    <div
      className={[
        'rounded-full px-3 py-1.5 text-xs font-semibold',
        active ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-500',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

function GhostPill({ children, active }: { children: string; active?: boolean }) {
  return (
    <div
      className={[
        'rounded-full px-3 py-1.5 text-xs font-medium',
        active ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-400',
      ].join(' ')}
    >
      {children}
    </div>
  );
}

function StickyNote({
  x,
  y,
  width,
  text,
  tone = 'yellow',
}: Sticky) {
  const tones = {
    yellow: 'bg-[#f4de93] text-[#5b4310]',
    mint: 'bg-[#c9f0d9] text-[#1f5e3c]',
    peach: 'bg-[#ffd2bf] text-[#7a3d2a]',
  };

  return (
    <div
      className={`absolute rounded-[10px] px-4 py-4 text-sm leading-6 shadow-[0_10px_20px_rgba(15,23,42,0.10)] ${tones[tone]}`}
      style={{ left: x, top: y, width }}
    >
      {text.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </div>
  );
}

function FlowDiamond({ x, y, text }: Diamond) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <div className="flex h-28 w-28 rotate-45 items-center justify-center rounded-[20px] bg-violet-600 shadow-[0_16px_24px_rgba(109,40,217,0.24)]">
        <div className="-rotate-45 text-center text-xs font-semibold leading-5 text-white">{text}</div>
      </div>
    </div>
  );
}

function ConnectorPath({
  x1,
  y1,
  x2,
  y2,
  label,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label: string;
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const path = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;

  return (
    <g>
      <path d={path} fill="none" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round" />
      <circle cx={x1} cy={y1} r="6" fill="#8b5cf6" />
      <circle cx={x2} cy={y2} r="6" fill="#8b5cf6" />
      <text x={mx} y={my - 14} textAnchor="middle" fontSize="15" fontWeight="700" fill="#6d28d9">
        {label}
      </text>
    </g>
  );
}

const toneStyles: Record<Tone, { border: string; pill: string; sectionTag: string }> = {
  current: {
    border: 'border-emerald-200',
    pill: 'bg-emerald-100 text-emerald-700',
    sectionTag: 'bg-emerald-500 text-white',
  },
  future: {
    border: 'border-amber-200',
    pill: 'bg-amber-100 text-amber-700',
    sectionTag: 'bg-amber-500 text-white',
  },
  candidate: {
    border: 'border-rose-200',
    pill: 'bg-rose-100 text-rose-700',
    sectionTag: 'bg-rose-500 text-white',
  },
  shell: {
    border: 'border-sky-200',
    pill: 'bg-sky-100 text-sky-700',
    sectionTag: 'bg-sky-500 text-white',
  },
  flow: {
    border: 'border-violet-200',
    pill: 'bg-violet-100 text-violet-700',
    sectionTag: 'bg-violet-500 text-white',
  },
};
