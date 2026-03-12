const views = ['테이블', '칸반', '캘린더', '차트', '간트'];

const filters = ['검색', '상태', '담당자', '마일스톤', '정렬'];

const frames = [
  {
    status: '공통',
    route: 'shared shell',
    title: '워크스페이스 셸',
    description: '프로젝트 선택, 도메인 탭, 뷰 탭, 툴바를 모든 화면의 공통 기준으로 둡니다.',
    sections: ['프로젝트 선택 헤더', '도메인 탭', '뷰 탭', '검색/필터/정렬 툴바', '우측 패널/모달 후보 영역'],
  },
  {
    status: '현재',
    route: '/members',
    title: '멤버',
    description: '초대 기반 온보딩, 초대 상태, 역할 연결 진입점을 중심으로 구성합니다.',
    sections: ['멤버 목록 테이블', '초대 상태 배지', '역할 칩', '우측 초대 패널 후보'],
  },
  {
    status: '현재',
    route: '/roles',
    title: '역할 / 권한',
    description: '역할 리스트, 권한 매트릭스, 멤버 할당 영역을 한 화면 안에서 나눕니다.',
    sections: ['역할 리스트', '권한 매트릭스', '멤버 할당 패널', '정책 미확정 노트'],
  },
  {
    status: '현재',
    route: '/milestones',
    title: '마일스톤',
    description: '큰 목표와 연결 업무 진행률만 집계하는 요약형 화면입니다.',
    sections: ['마일스톤 카드', '진척도 바', '연결 업무 리스트', '지연/완료 요약'],
  },
  {
    status: '현재',
    route: '/tasks',
    title: '업무 보드',
    description: '마일스톤 그룹, 드래그앤드롭 가능한 row, 우측 상세 패널을 한 셸 안에 둡니다.',
    sections: ['마일스톤 그룹 헤더', '업무 테이블', 'DND 핸들/행', '선택된 업무 상세', '검토 진입 버튼'],
  },
  {
    status: '현재',
    route: '/reviews',
    title: '검토 Inbox',
    description: '프로젝트 전체 review 큐를 inbox 스타일로 모아서 보여줍니다.',
    sections: ['검토 큐 리스트', '상태 배지', '최근 라운드', '검토 흐름 안내'],
  },
  {
    status: '현재',
    route: '/reviews/:reviewId',
    title: '검토 상세',
    description: '본문, 히스토리, 첨부, 코멘트, 승인 액션을 한 화면에서 다룹니다.',
    sections: ['본문 패널', '상태/메타 패널', '첨부/코멘트', '히스토리 타임라인', '액션 바'],
  },
  {
    status: '현재',
    route: '/tasks/:taskId/reviews/new',
    title: '검토 상신 / 수정',
    description: '상신과 수정은 같은 폼 구조를 공유하고, 추후 팝업 전환도 가능하게 둡니다.',
    sections: ['본문 입력', '참조자/추가 검토자', '첨부 영역', '확인/취소 CTA'],
  },
  {
    status: '후속',
    route: 'future view',
    title: '칸반 / 캘린더 / 차트 / 간트',
    description: '같은 데이터가 다른 시각화로 확장되는 미래 뷰 프리뷰입니다.',
    sections: ['칸반 컬럼 미리보기', '캘린더 월간 뷰', '차트 요약 카드', '간트 타임라인'],
  },
];

const overlays = [
  '멤버 초대 모달',
  '검토 처리 모달',
  '역할 생성 / 수정 모달',
  '업무 상신 패널',
];

export default function WireframesPage() {
  return (
    <div className="min-h-screen bg-[#f3f5f8] px-8 py-8 text-slate-900">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-8">
        <section className="rounded-[28px] border border-slate-200 bg-white px-8 py-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-start justify-between gap-8">
            <div>
              <div className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Front-vibe Mid-Fi Wireframes
              </div>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950">워크스페이스 기반 화면설계</h1>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
                현재 구현된 도메인 화면과 앞으로 추가될 뷰를 같은 셸 안에서 비교할 수 있도록 정리한 미드파이
                와이어프레임입니다.
              </p>
            </div>
            <div className="grid min-w-[320px] grid-cols-2 gap-3 rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm">
              <StatCard label="현재 구현" value="6개 화면군" />
              <StatCard label="후속 뷰" value="4개 뷰" />
              <StatCard label="공통 패턴" value="셸 + 툴바" />
              <StatCard label="오버레이 후보" value="4개" />
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white px-8 py-8 shadow-[0_20px_48px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center gap-3">
            <Pill tone="blue">프로젝트 선택</Pill>
            <Pill tone="slate">멤버</Pill>
            <Pill tone="slate">역할 / 권한</Pill>
            <Pill tone="slate">마일스톤</Pill>
            <Pill tone="slate">업무</Pill>
            <Pill tone="slate">검토</Pill>
          </div>
          <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4">
              {views.map((view, index) => (
                <button
                  key={view}
                  type="button"
                  className={[
                    'rounded-full px-4 py-2 text-sm font-semibold',
                    index === 0 ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-400',
                  ].join(' ')}
                >
                  {view}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {filters.map((filter) => (
                <div key={filter} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
                  {filter}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          {frames.map((frame) => (
            <article
              key={`${frame.status}-${frame.title}`}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Pill tone={frame.status === '현재' ? 'teal' : frame.status === '후속' ? 'amber' : 'blue'}>
                    {frame.status}
                  </Pill>
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-slate-500">{frame.route}</span>
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Frame</span>
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-950">{frame.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{frame.description}</p>

              <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-[#fafbfc] p-5">
                <div className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr]">
                  <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                    <div className="mb-4 h-10 rounded-xl bg-slate-100" />
                    <div className="grid gap-3">
                      <div className="h-12 rounded-xl bg-slate-100" />
                      <div className="grid grid-cols-3 gap-3">
                        <div className="h-28 rounded-2xl bg-slate-100" />
                        <div className="h-28 rounded-2xl bg-slate-100" />
                        <div className="h-28 rounded-2xl bg-slate-100" />
                      </div>
                      <div className="h-64 rounded-[22px] border border-slate-200 bg-white" />
                    </div>
                  </div>
                  <div className="rounded-[22px] border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">구성 영역</div>
                    <ul className="mt-4 space-y-3">
                      {frame.sections.map((section) => (
                        <li key={section} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                          {section}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white px-8 py-8 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">오버레이 후보와 후속 흐름</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                아직 확정되지 않았지만 현재 구조상 모달 또는 우측 패널로 확장 가능한 인터랙션입니다.
              </p>
            </div>
            <Pill tone="purple">Overlay Candidate</Pill>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {overlays.map((overlay) => (
              <div key={overlay} className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm font-semibold text-slate-700">
                {overlay}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Pill({ children, tone }: { children: string; tone: 'blue' | 'teal' | 'amber' | 'slate' | 'purple' }) {
  const tones = {
    blue: 'bg-blue-100 text-blue-700',
    teal: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    slate: 'bg-slate-200 text-slate-700',
    purple: 'bg-violet-100 text-violet-700',
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 text-lg font-bold text-slate-950">{value}</div>
    </div>
  );
}
