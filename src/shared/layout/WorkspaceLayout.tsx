import { LayoutTemplate, MoreHorizontal, Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import BoardToolbar from '../../components/BoardToolbar';
import Header from '../../components/Header';

type Props = {
  children: ReactNode;
};

export default function WorkspaceLayout({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const shell = getShellConfig(location.pathname);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col overflow-hidden">
      <Header title={shell.title} />

      <div className="flex items-center px-6 border-b border-gray-200 overflow-x-auto hide-scrollbar bg-white">
        <NavItem to="/tasks" icon={<LayoutTemplate size={16} />}>
          메인 테이블
        </NavItem>
        <NavGhost>Dashboard</NavGhost>
        <NavGhost>차트</NavGhost>
        <NavGhost>간트</NavGhost>
        <NavGhost>테이블</NavGhost>
        <NavGhost>Doc</NavGhost>
        <NavGhost>파일 갤러리</NavGhost>
        <NavGhost>양식</NavGhost>
        <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
          <Plus size={18} />
        </button>
      </div>

      <BoardToolbar
        primaryLabel={shell.primaryLabel}
        onOpenModal={() => navigate(shell.primaryTo)}
      />

      <main className="flex-1 overflow-y-auto px-6 pb-20">{children}</main>
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
    <button className="px-1 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-b-2 border-transparent whitespace-nowrap mr-6">
      {children}
    </button>
  );
}

function getShellConfig(pathname: string) {
  if (pathname.startsWith('/reviews/') && pathname.endsWith('/edit')) {
    return {
      title: 'Review Edit',
      primaryLabel: '상신 화면으로 이동',
      primaryTo: '/tasks/10/reviews/new',
    };
  }

  if (pathname.startsWith('/reviews/')) {
    return {
      title: 'Review Detail',
      primaryLabel: '검토 상신',
      primaryTo: '/tasks/10/reviews/new',
    };
  }

  if (pathname.endsWith('/reviews/new')) {
    return {
      title: 'Review Submit',
      primaryLabel: '업무 목록으로 이동',
      primaryTo: '/tasks',
    };
  }

  if (pathname.includes('/reviews')) {
    return {
      title: 'Review Board',
      primaryLabel: '검토 상신',
      primaryTo: pathname.endsWith('/reviews') ? `${pathname}/new` : '/tasks/10/reviews/new',
    };
  }

  return {
    title: 'Work Management Board',
    primaryLabel: '검토 상신',
    primaryTo: '/tasks/10/reviews/new',
  };
}
