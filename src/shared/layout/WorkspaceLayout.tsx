import {
  CalendarClock,
  ChartColumn,
  ChevronRight,
  Home,
  KanbanSquare,
  LayoutTemplate,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import BoardToolbar from '../../components/BoardToolbar';
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
} from '../../components/ui/sidebar';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

type Props = {
  children: ReactNode;
};

export default function WorkspaceLayout({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const shell = getShellConfig(location.pathname);
  const { projects, currentProject, selectedProjectId, setSelectedProjectId } = useWorkspace();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="none" className="border-r border-border/60">
        <SidebarHeader className="px-3 py-4">
          <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/70 p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Home size={18} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-sidebar-foreground">front-vibe</div>
                <div className="text-xs text-sidebar-foreground/70">workspace shell</div>
              </div>
            </div>
          </div>
          <div className="relative mt-3">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/55" />
            <Input
              placeholder="업무, 검토, 멤버 검색"
              className="h-10 rounded-xl border-sidebar-border bg-sidebar pl-9 text-sidebar-foreground placeholder:text-sidebar-foreground/50"
            />
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>프로젝트</SidebarGroupLabel>
            <SidebarGroupContent className="px-2">
              <Select value={selectedProjectId ?? currentProject?.id ?? ''} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="h-10 rounded-xl border-sidebar-border bg-sidebar text-sidebar-foreground shadow-none">
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
            <SidebarGroupLabel>도메인</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {[
                  { to: '/tasks', label: '업무', icon: LayoutTemplate, count: currentProject?.openTaskCount },
                  { to: '/reviews', label: '검토', icon: CalendarClock, count: currentProject?.reviewQueueCount },
                  { to: '/members', label: '멤버', icon: Users, count: currentProject?.memberCount },
                  { to: '/roles', label: '역할 / 권한', icon: ShieldCheck },
                  { to: '/milestones', label: '마일스톤', icon: KanbanSquare, count: currentProject?.milestoneCount },
                ].map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={shell.domainPath === item.to} tooltip={item.label}>
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

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>뷰 확장</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {[
                  { label: '칸반', icon: KanbanSquare },
                  { label: '캘린더', icon: CalendarClock },
                  { label: '차트', icon: ChartColumn },
                  { label: '간트', icon: ChevronRight },
                ].map(({ label, icon: Icon }) => (
                    <SidebarMenuItem key={String(label)}>
                      <SidebarMenuButton tooltip={String(label)} className="opacity-55">
                        <Icon />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-3 pb-4">
          {currentProject && (
            <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/70 p-3 text-xs text-sidebar-foreground/80">
              <div className="font-semibold text-sidebar-foreground">{currentProject.ownerName}</div>
              <div className="mt-1">업데이트 {formatDate(currentProject.updatedAt)}</div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-sidebar/70">
                <div className="h-full rounded-full bg-primary" style={{ width: `${currentProject.progress}%` }} />
              </div>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_20%),linear-gradient(180deg,#f7f9fc_0%,#fbfcfe_100%)]">
        <div className="flex min-h-screen flex-col">
          <div className="border-b border-border/60 bg-background/92 backdrop-blur">
            <Header
              title={shell.title}
              subtitle={shell.subtitle}
              projects={projects.map((project) => ({
                id: project.id,
                name: project.name,
                code: project.code,
              }))}
              selectedProjectId={selectedProjectId}
              onProjectChange={setSelectedProjectId}
              stats={
                currentProject
                  ? [
                      { label: '멤버', value: `${currentProject.memberCount}명` },
                      { label: '열린 업무', value: `${currentProject.openTaskCount}건` },
                      { label: '검토 큐', value: `${currentProject.reviewQueueCount}건` },
                    ]
                  : []
              }
              compactMeta
            />

            <div className="px-6">
              <div className="flex items-center overflow-x-auto rounded-t-[24px] border border-b-0 border-border/70 bg-card px-4 hide-scrollbar">
                <NavItem to="/tasks" icon={<LayoutTemplate size={16} />}>
                  테이블
                </NavItem>
                <NavGhost>칸반</NavGhost>
                <NavGhost>캘린더</NavGhost>
                <NavGhost>차트</NavGhost>
                <NavGhost>간트</NavGhost>
              </div>

              <BoardToolbar
                primaryLabel={shell.primaryLabel}
                filterLabels={shell.filterLabels}
                contextLabel={shell.contextLabel}
                onOpenModal={() => navigate(shell.primaryTo)}
              />
            </div>
          </div>

          <main className="flex-1 px-6 pb-10 pt-1">{children}</main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

type NavItemProps = {
  to: string;
  icon: ReactNode;
  children: ReactNode;
};

function NavItem({ to, icon, children }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'px-3 py-3 text-sm font-medium whitespace-nowrap flex items-center gap-1.5 mr-2 group border-b-2 transition-colors rounded-t-xl',
          isActive
            ? 'border-primary text-primary bg-primary/5'
            : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60',
        ].join(' ')
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}

function NavGhost({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      disabled
      className="mr-2 whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-medium text-muted-foreground/45"
    >
      {children}
    </button>
  );
}

function getShellConfig(pathname: string) {
  if (pathname.startsWith('/members')) {
    return {
      domain: 'members',
      domainPath: '/members',
      title: 'Members',
      subtitle: '초대 기반 멤버십과 프로젝트 역할 연결을 관리합니다.',
      primaryLabel: '멤버 초대',
      primaryTo: '/members#invite',
      contextLabel: 'members',
      filterLabels: ['초대 상태', '역할', '팀'],
    };
  }

  if (pathname.startsWith('/roles')) {
    return {
      domain: 'roles',
      domainPath: '/roles',
      title: 'Roles & Permissions',
      subtitle: '프로젝트 단위 RBAC 카탈로그와 권한 매핑을 다룹니다.',
      primaryLabel: '역할 카탈로그',
      primaryTo: '/roles',
      contextLabel: 'rbac',
      filterLabels: ['카테고리', '할당 멤버'],
    };
  }

  if (pathname.startsWith('/milestones')) {
    return {
      domain: 'milestones',
      domainPath: '/milestones',
      title: 'Milestones',
      subtitle: '큰 목표와 연결 업무 진행률만 집계해서 보여줍니다.',
      primaryLabel: '마일스톤 보기',
      primaryTo: '/milestones',
      contextLabel: 'milestones',
      filterLabels: ['헬스 상태', '기한'],
    };
  }

  if (pathname.startsWith('/reviews/') && pathname.endsWith('/edit')) {
    return {
      domain: 'reviews',
      domainPath: '/reviews',
      title: 'Review Edit',
      subtitle: '기존 review 라운드를 수정합니다.',
      primaryLabel: '검토 inbox로 이동',
      primaryTo: '/reviews',
      contextLabel: 'reviews',
      filterLabels: ['상태', '라운드'],
    };
  }

  if (pathname.startsWith('/reviews/')) {
    return {
      domain: 'reviews',
      domainPath: '/reviews',
      title: 'Review Detail',
      subtitle: '본문, 첨부, 코멘트, 이력을 하나의 화면에서 확인합니다.',
      primaryLabel: '검토 inbox로 이동',
      primaryTo: '/reviews',
      contextLabel: 'reviews',
      filterLabels: ['상태', '라운드'],
    };
  }

  if (pathname.endsWith('/reviews/new')) {
    return {
      domain: 'reviews',
      domainPath: '/reviews',
      title: 'Review Submit',
      subtitle: '업무에서 review 라운드를 생성하거나 재상신합니다.',
      primaryLabel: '업무 목록으로 이동',
      primaryTo: '/tasks',
      contextLabel: 'reviews',
      filterLabels: ['상태', '라운드'],
    };
  }

  if (pathname === '/reviews') {
    return {
      domain: 'reviews',
      domainPath: '/reviews',
      title: 'Review Inbox',
      subtitle: '프로젝트 전체 review 큐와 최근 라운드를 모아서 봅니다.',
      primaryLabel: '검토 큐 보기',
      primaryTo: '/reviews',
      contextLabel: 'reviews',
      filterLabels: ['상태', '라운드', '참조자'],
    };
  }

  if (pathname.includes('/reviews')) {
    return {
      domain: 'reviews',
      domainPath: '/reviews',
      title: 'Review Board',
      subtitle: '업무별 review 라운드를 탐색합니다.',
      primaryLabel: '검토 상신',
      primaryTo: pathname.endsWith('/reviews') ? `${pathname}/new` : '/reviews',
      contextLabel: 'reviews',
      filterLabels: ['상태', '라운드', '참조자'],
    };
  }

  return {
    domain: 'tasks',
    domainPath: '/tasks',
    title: 'Task Board',
    subtitle: '마일스톤 단위 보드와 업무-검토 진입 패널을 제공합니다.',
    primaryLabel: '업무 보드 보기',
    primaryTo: '/tasks',
    contextLabel: 'tasks',
    filterLabels: ['마일스톤', '상태', '담당자'],
  };
}
