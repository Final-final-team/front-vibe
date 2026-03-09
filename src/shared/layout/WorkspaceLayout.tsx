import { LayoutTemplate, MoreHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import BoardToolbar from '../../components/BoardToolbar';
import Header from '../../components/Header';
import { useWorkspace } from '../../features/workspace/use-workspace';
import { formatDate } from '../lib/format';
import StatusPill from '../ui/StatusPill';

type Props = {
  children: ReactNode;
};

export default function WorkspaceLayout({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const shell = getShellConfig(location.pathname);
  const { projects, currentProject, selectedProjectId, setSelectedProjectId } = useWorkspace();

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-white font-sans text-gray-800">
      <Header
        title={shell.title}
        subtitle={shell.subtitle}
        projectName={currentProject?.name}
        projectCode={currentProject?.code}
        projects={projects.map((project) => ({
          id: project.id,
          name: project.name,
          code: project.code,
        }))}
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
      />

      {currentProject && (
        <section className="border-b border-gray-200 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-6 py-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone="blue">{currentProject.code}</StatusPill>
                <StatusPill tone="purple">Project Context</StatusPill>
                <StatusPill tone="slate">Updated {formatDate(currentProject.updatedAt)}</StatusPill>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">{currentProject.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="teal">{currentProject.memberCount} members</StatusPill>
              <StatusPill tone="slate">{currentProject.openTaskCount} open tasks</StatusPill>
              <StatusPill tone="amber">{currentProject.reviewQueueCount} review queue</StatusPill>
              <StatusPill tone="slate">{currentProject.milestoneCount} milestones</StatusPill>
            </div>
          </div>
        </section>
      )}

      <div className="flex items-center overflow-x-auto border-b border-gray-200 bg-white px-6 hide-scrollbar">
        <DomainNavItem to="/members" active={shell.domain === 'members'}>
          멤버
        </DomainNavItem>
        <DomainNavItem to="/roles" active={shell.domain === 'roles'}>
          역할 / 권한
        </DomainNavItem>
        <DomainNavItem to="/milestones" active={shell.domain === 'milestones'}>
          마일스톤
        </DomainNavItem>
        <DomainNavItem to="/tasks" active={shell.domain === 'tasks'}>
          업무
        </DomainNavItem>
        <DomainNavItem to="/reviews" active={shell.domain === 'reviews'}>
          검토
        </DomainNavItem>
      </div>

      <div className="flex items-center overflow-x-auto border-b border-gray-200 bg-white px-6 hide-scrollbar">
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

      <main className="flex-1 overflow-y-auto px-6 pb-20 pt-6">{children}</main>
    </div>
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
          'px-1 py-3 text-sm font-medium whitespace-nowrap flex items-center gap-1.5 mr-6 group border-b-2 transition-colors',
          isActive
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50',
        ].join(' ')
      }
    >
      {icon}
      {children}
      <MoreHorizontal size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </NavLink>
  );
}

function NavGhost({ children }: { children: ReactNode }) {
  return (
    <button
      type="button"
      disabled
      className="mr-6 whitespace-nowrap border-b-2 border-transparent px-1 py-3 text-sm font-medium text-gray-300"
    >
      {children}
    </button>
  );
}

function DomainNavItem({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={[
        'mr-6 border-b-2 px-1 py-3 text-sm font-semibold whitespace-nowrap transition-colors',
        active ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-900',
      ].join(' ')}
    >
      {children}
    </NavLink>
  );
}

function getShellConfig(pathname: string) {
  if (pathname.startsWith('/members')) {
    return {
      domain: 'members',
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
    title: 'Task Board',
    subtitle: '마일스톤 단위 보드와 업무-검토 진입 패널을 제공합니다.',
    primaryLabel: '업무 보드 보기',
    primaryTo: '/tasks',
    contextLabel: 'tasks',
    filterLabels: ['마일스톤', '상태', '담당자'],
  };
}
