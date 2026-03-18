import {
  CalendarClock,
  ChartColumn,
  ChevronRight,
  Home,
  History,
  KanbanSquare,
  LayoutTemplate,
  Layers3,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink, useLocation, useSearchParams } from 'react-router-dom';
import Header from '../../components/Header';
import { useWorkspace } from '../../features/workspace/use-workspace';
import { formatDate } from '../lib/format';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '../../components/ui/sidebar';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Button } from '../../components/ui/button';
import { appConfig } from '../config/app-config';

type Props = {
  children: ReactNode;
};

export default function WorkspaceLayout({ children }: Props) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const shell = getShellConfig(location.pathname);
  const { projects, currentProject, currentProjectDetail, selectedProjectId, setSelectedProjectId } = useWorkspace();
  const taskView = searchParams.get('view') ?? 'table';
  const isProjectHub = shell.domainPath === 'projects';
  const showTaskViewExpansion = shell.domainPath === 'tasks';
  const projectBasePath = `/projects/${currentProject?.id ?? appConfig.defaultProjectId}`;

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="icon" className="border-r border-border/60">
        <SidebarHeader className="px-2.5 py-3">
          <div className="flex items-center justify-between gap-2 px-1 group-data-[collapsible=icon]:justify-center">
            <NavLink to="/projects" className="flex min-w-0 items-center gap-2 group-data-[collapsible=icon]:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-sidebar-border bg-background text-primary shadow-sm">
                <Home size={16} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-sidebar-foreground">front-vibe</div>
                <div className="text-xs text-sidebar-foreground/70">협업 워크스페이스</div>
              </div>
            </NavLink>
            <SidebarTrigger className="h-7 w-7 rounded-md border border-sidebar-border/80 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground group-data-[collapsible=icon]:h-9 group-data-[collapsible=icon]:w-9" />
          </div>
          <div className="relative mt-3 group-data-[collapsible=icon]:hidden">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/55" />
            <Input
              placeholder={isProjectHub ? '프로젝트 검색' : '업무, 검토, 멤버 검색'}
              className="h-9 rounded-lg border-sidebar-border bg-sidebar pl-9 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/50"
            />
          </div>
        </SidebarHeader>

        <SidebarContent>
          {!isProjectHub ? (
            <>
              <SidebarGroup>
                <SidebarGroupLabel>프로젝트</SidebarGroupLabel>
                <SidebarGroupContent className="px-2 group-data-[collapsible=icon]:hidden">
                  <Select value={selectedProjectId ?? currentProject?.id ?? ''} onValueChange={setSelectedProjectId}>
                    <SelectTrigger className="h-8 rounded-lg border-sidebar-border bg-sidebar text-sm text-sidebar-foreground shadow-none">
                      <SelectValue placeholder="프로젝트 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name} ({project.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarSeparator />

              <SidebarGroup>
                <SidebarGroupLabel>메뉴</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {[
                      { to: '/projects', domainKey: 'projects', label: '프로젝트 허브', icon: Home },
                      { to: `${projectBasePath}/tasks`, domainKey: 'tasks', label: '업무', icon: LayoutTemplate, count: currentProject?.openTaskCount },
                      { to: `${projectBasePath}/reviews`, domainKey: 'reviews', label: '검토', icon: CalendarClock, count: currentProject?.reviewQueueCount },
                      { to: `${projectBasePath}/members`, domainKey: 'members', label: '멤버', icon: Users },
                      { to: `${projectBasePath}/roles`, domainKey: 'roles', label: '역할 / 권한', icon: ShieldCheck },
                      { to: `${projectBasePath}/milestones`, domainKey: 'milestones', label: '마일스톤', icon: Layers3 },
                      { to: `${projectBasePath}/audit-logs`, domainKey: 'audit-logs', label: '감사 로그', icon: History },
                    ].map((item) => (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton asChild isActive={shell.domainPath === item.domainKey} tooltip={item.label}>
                          <NavLink to={item.to}>
                            <item.icon />
                            <span>{item.label}</span>
                          </NavLink>
                        </SidebarMenuButton>
                        {typeof item.count === 'number' && <SidebarMenuBadge>{item.count}</SidebarMenuBadge>}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          ) : (
            <SidebarGroup>
              <SidebarGroupLabel>허브</SidebarGroupLabel>
              <SidebarGroupContent className="px-2">
                <div className="rounded-2xl border border-sidebar-border bg-sidebar px-3 py-3 text-sm leading-6 text-sidebar-foreground/80 group-data-[collapsible=icon]:hidden">
                  프로젝트 카드를 고른 뒤에만 업무와 검토 메뉴가 열립니다.
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {showTaskViewExpansion ? (
            <>
              <SidebarSeparator />

              <SidebarGroup>
                <SidebarGroupLabel>뷰 확장</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {[
                      { label: '칸반', icon: KanbanSquare, value: 'kanban' },
                      { label: '캘린더', icon: CalendarClock, value: 'calendar' },
                      { label: '차트', icon: ChartColumn, value: 'chart' },
                      { label: '간트', icon: ChevronRight, value: 'gantt' },
                    ].map(({ label, icon: Icon, value }) => (
                      <SidebarMenuItem key={String(label)}>
                        <SidebarMenuButton
                          asChild
                          tooltip={String(label)}
                          isActive={taskView === value}
                          className={taskView === value ? '' : 'opacity-85'}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              const next = new URLSearchParams(searchParams);
                              next.set('view', value);
                              setSearchParams(next, { replace: true });
                            }}
                          >
                            <Icon />
                            <span>{label}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          ) : null}
        </SidebarContent>

        <SidebarFooter className="px-2.5 pb-3 group-data-[collapsible=icon]:hidden">
          {!isProjectHub && currentProject && (
            <div className="border-t border-sidebar-border px-1 pt-3 text-xs text-sidebar-foreground/80">
              <div className="font-semibold text-sidebar-foreground">{currentProject.ownerName}</div>
              {currentProjectDetail ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <span className="rounded-full border border-sidebar-border bg-sidebar px-2 py-1 text-[10px] font-semibold text-sidebar-foreground/75">
                    {getMembershipLabel(currentProjectDetail.membershipStatus)}
                  </span>
                  <span className="rounded-full border border-sidebar-border bg-sidebar px-2 py-1 text-[10px] font-semibold text-sidebar-foreground/75">
                    {getProjectStatusLabel(currentProjectDetail.status)}
                  </span>
                </div>
              ) : null}
              <div className="mt-1">업데이트 {formatDate(currentProject.updatedAt)}</div>
              <div className="mt-2.5 h-1.5 overflow-hidden bg-sidebar/70">
                <div className="h-full bg-primary" style={{ width: `${currentProject.progress}%` }} />
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-[var(--surface-shell)]">
        <div className="flex min-h-screen flex-col">
          <div className="border-b border-border/70 bg-white/78 backdrop-blur">
            <Header
              title={shell.title}
              subtitle={shell.subtitle}
              projects={
                isProjectHub
                  ? []
                  : projects.map((project) => ({
                      id: project.id,
                      name: project.name,
                      code: project.code,
                    }))
              }
              selectedProjectId={isProjectHub ? null : selectedProjectId}
              onProjectChange={isProjectHub ? undefined : setSelectedProjectId}
              stats={
                !isProjectHub && currentProject
                  ? [
                      { label: '멤버', value: `${currentProject.memberCount}명` },
                      { label: '열린 업무', value: `${currentProject.openTaskCount}건` },
                      { label: '검토 큐', value: `${currentProject.reviewQueueCount}건` },
                    ]
                  : []
              }
              compactMeta
            />

            {shell.domainPath === 'tasks' ? (
              <>
                <div className="hidden items-center gap-2 overflow-x-auto px-4 pb-3 pt-2 hide-scrollbar md:flex">
                <ViewSwitchButton
                  icon={<LayoutTemplate size={16} />}
                  active={taskView === 'table'}
                  onClick={() => updateView('table', searchParams, setSearchParams)}
                >
                  테이블
                </ViewSwitchButton>
                <ViewSwitchButton
                  icon={<KanbanSquare size={16} />}
                  active={taskView === 'kanban'}
                  onClick={() => updateView('kanban', searchParams, setSearchParams)}
                >
                  칸반
                </ViewSwitchButton>
                <ViewSwitchButton
                  icon={<CalendarClock size={16} />}
                  active={taskView === 'calendar'}
                  onClick={() => updateView('calendar', searchParams, setSearchParams)}
                >
                  캘린더
                </ViewSwitchButton>
                <ViewSwitchButton
                  icon={<ChartColumn size={16} />}
                  active={taskView === 'chart'}
                  onClick={() => updateView('chart', searchParams, setSearchParams)}
                >
                  차트
                </ViewSwitchButton>
                <ViewSwitchButton
                  icon={<ChevronRight size={16} />}
                  active={taskView === 'gantt'}
                  onClick={() => updateView('gantt', searchParams, setSearchParams)}
                >
                  간트
                </ViewSwitchButton>
                </div>

                <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-2 md:hidden">
                  <div className="flex min-w-0 items-center gap-1 overflow-x-auto hide-scrollbar">
                    <ViewSwitchButton
                      icon={<LayoutTemplate size={15} />}
                      active={taskView === 'table'}
                      mobile
                      onClick={() => updateView('table', searchParams, setSearchParams)}
                    >
                      테이블
                    </ViewSwitchButton>
                    <ViewSwitchButton
                      icon={<KanbanSquare size={15} />}
                      active={taskView === 'kanban'}
                      mobile
                      onClick={() => updateView('kanban', searchParams, setSearchParams)}
                    >
                      칸반
                    </ViewSwitchButton>
                    <ViewSwitchButton
                      icon={<CalendarClock size={15} />}
                      active={taskView === 'calendar'}
                      mobile
                      onClick={() => updateView('calendar', searchParams, setSearchParams)}
                    >
                      캘린더
                    </ViewSwitchButton>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-7 shrink-0 rounded-md px-2.5 text-[11px]"
                      >
                        {taskView === 'chart' ? '차트' : taskView === 'gantt' ? '간트' : '더보기'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      <DropdownMenuItem onClick={() => updateView('chart', searchParams, setSearchParams)}>
                        차트
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateView('gantt', searchParams, setSearchParams)}>
                        간트
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : null}
          </div>

          <main className="flex-1 px-3 pb-5 pt-2 md:px-4 xl:px-6">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function ViewSwitchButton({
  icon,
  active,
  children,
  onClick,
  mobile = false,
}: {
  icon: ReactNode;
  active: boolean;
  children: ReactNode;
  onClick: () => void;
  mobile?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex items-center gap-2 rounded-full border px-3 py-2 font-medium transition-all',
        mobile ? 'shrink-0 text-xs' : 'text-[13px]',
        active
          ? 'border-primary/25 bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(37,99,235,0.18)]'
          : 'border-border/70 bg-background/70 text-muted-foreground hover:border-primary/20 hover:text-foreground',
      ].join(' ')}
    >
      {icon}
      {children}
    </button>
  );
}

function updateView(
  value: string,
  searchParams: URLSearchParams,
  setSearchParams: (nextInit: URLSearchParams, navigateOptions?: { replace?: boolean }) => void,
) {
  const next = new URLSearchParams(searchParams);
  next.set('view', value);
  setSearchParams(next, { replace: true });
}

function getShellConfig(pathname: string) {
  if (pathname === '/projects') {
    return {
      domain: 'projects',
      domainPath: 'projects',
      title: '프로젝트 허브',
      subtitle: '집 아이콘에서 진입하는 메인 프로젝트 카드 화면입니다.',
      primaryLabel: '프로젝트 허브',
      primaryTo: '/projects',
      contextLabel: 'projects',
      filterLabels: ['프로젝트', '진행률'],
    };
  }

  if (pathname.includes('/members')) {
    return {
      domain: 'members',
      domainPath: 'members',
      title: '멤버',
      subtitle: '프로젝트 구성원 현황, 초대 준비, 역할 할당 상태를 한 화면에서 확인합니다.',
      primaryLabel: '업무로 이동',
      primaryTo: `/projects/${appConfig.defaultProjectId}/tasks`,
      contextLabel: 'members',
      filterLabels: ['백엔드 미지원'],
    };
  }

  if (pathname.includes('/roles')) {
    return {
      domain: 'roles',
      domainPath: 'roles',
      title: '역할 / 권한',
      subtitle: '역할 카탈로그와 권한 정책을 관리자 시점에서 검토합니다.',
      primaryLabel: '업무로 이동',
      primaryTo: `/projects/${appConfig.defaultProjectId}/tasks`,
      contextLabel: 'rbac',
      filterLabels: ['백엔드 미지원'],
    };
  }

  if (pathname.includes('/milestones')) {
    return {
      domain: 'milestones',
      domainPath: 'milestones',
      title: '마일스톤',
      subtitle: '마일스톤 단위로 진행률, 위험, 연결 업무를 확인합니다.',
      primaryLabel: '업무로 이동',
      primaryTo: `/projects/${appConfig.defaultProjectId}/tasks`,
      contextLabel: 'milestones',
      filterLabels: ['위험', '진행률'],
    };
  }

  if (pathname.includes('/audit-logs')) {
    return {
      domain: 'audit-logs',
      domainPath: 'audit-logs',
      title: '감사 로그',
      subtitle: '역할 변경과 검토 이력을 프로젝트 단위로 묶어서 확인합니다.',
      primaryLabel: '업무로 이동',
      primaryTo: `/projects/${appConfig.defaultProjectId}/tasks`,
      contextLabel: 'audit',
      filterLabels: ['행위자', '액션'],
    };
  }

  if (pathname.startsWith('/reviews/') && pathname.endsWith('/edit')) {
    return {
      domain: 'reviews',
      domainPath: 'reviews',
      title: '검토 수정',
      subtitle: '기존 review 라운드를 수정합니다.',
      primaryLabel: '검토 inbox로 이동',
      primaryTo: `/projects/${appConfig.defaultProjectId}/reviews`,
      contextLabel: 'reviews',
      filterLabels: ['상태', '라운드'],
    };
  }

  if (pathname.startsWith('/reviews/')) {
    return {
      domain: 'reviews',
      domainPath: 'reviews',
      title: '검토 상세',
      subtitle: '본문, 첨부, 코멘트, 이력을 하나의 화면에서 확인합니다.',
      primaryLabel: '검토 inbox로 이동',
      primaryTo: `/projects/${appConfig.defaultProjectId}/reviews`,
      contextLabel: 'reviews',
      filterLabels: ['상태', '라운드'],
    };
  }

  if (pathname.endsWith('/reviews/new')) {
    return {
      domain: 'reviews',
      domainPath: 'reviews',
      title: '검토 상신',
      subtitle: '업무에서 review 라운드를 생성하거나 재상신합니다.',
      primaryLabel: '업무 목록으로 이동',
      primaryTo: `/projects/${appConfig.defaultProjectId}/tasks`,
      contextLabel: 'reviews',
      filterLabels: ['상태', '라운드'],
    };
  }

  if (pathname.endsWith('/reviews')) {
    return {
      domain: 'reviews',
      domainPath: 'reviews',
      title: '검토 보관함',
      subtitle: '프로젝트 전체 검토 큐와 최근 라운드를 모아서 봅니다.',
      primaryLabel: '검토 큐 보기',
      primaryTo: pathname,
      contextLabel: 'reviews',
      filterLabels: ['상태', '라운드', '참조자'],
    };
  }

  if (pathname.includes('/reviews')) {
    return {
      domain: 'reviews',
      domainPath: 'reviews',
      title: '검토 보드',
      subtitle: '업무별 검토 라운드를 탐색합니다.',
      primaryLabel: '검토 상신',
      primaryTo: pathname.endsWith('/reviews') ? `${pathname}/new` : `/projects/${appConfig.defaultProjectId}/reviews`,
      contextLabel: 'reviews',
      filterLabels: ['상태', '라운드', '참조자'],
    };
  }

  return {
    domain: 'tasks',
    domainPath: 'tasks',
    title: '업무 보드',
    subtitle: '백엔드 프로젝트 업무와 검토 진입 흐름을 기준으로 보여줍니다.',
    primaryLabel: '업무 보드 보기',
    primaryTo: `/projects/${appConfig.defaultProjectId}/tasks`,
    contextLabel: 'tasks',
    filterLabels: ['상태', '우선순위', '검토 상태'],
  };
}

function getMembershipLabel(status: string) {
  switch (status) {
    case 'ACTIVE':
      return '참여중';
    case 'INVITED':
      return '초대 대기';
    case 'DECLINED':
      return '참여 거절';
    case 'EXPIRED':
      return '초대 만료';
    default:
      return status;
  }
}

function getProjectStatusLabel(status: string) {
  switch (status) {
    case 'ACTIVE':
      return '활성 프로젝트';
    case 'ARCHIVED':
      return '보관 프로젝트';
    case 'DELETED':
      return '삭제 프로젝트';
    default:
      return status;
  }
}
