import { ArrowUpDown, ChevronDown, EyeOff, Filter, LayoutTemplate, MoreHorizontal, Search, User } from 'lucide-react';

interface BoardToolbarProps {
  onOpenModal: () => void;
  primaryLabel?: string;
}

export default function BoardToolbar({
  onOpenModal,
  primaryLabel = '새로운 아이템 (5W1H 할당)',
}: BoardToolbarProps) {
  return (
    <div className="px-6 py-4 flex items-center gap-4">
      <div className="flex rounded-md shadow-sm">
        <button 
          onClick={onOpenModal}
          className="bg-blue-600 text-white px-4 py-1.5 text-sm font-medium rounded-l hover:bg-blue-700 flex items-center gap-1"
        >
          {primaryLabel}
        </button>
        <button className="bg-blue-600 border-l border-blue-500 text-white px-2 py-1.5 rounded-r hover:bg-blue-700">
          <ChevronDown size={16} />
        </button>
      </div>
      
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <button className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1.5 rounded">
          <Search size={16} /> 검색
        </button>
        <button className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1.5 rounded">
          <User size={16} /> 사람
        </button>
        <button className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1.5 rounded">
          <Filter size={16} /> 필터 <ChevronDown size={14} className="text-gray-400" />
        </button>
        <button className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1.5 rounded">
          <ArrowUpDown size={16} /> 정렬
        </button>
        <button className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1.5 rounded">
          <EyeOff size={16} /> 숨기기
        </button>
        <button className="flex items-center gap-1.5 hover:bg-gray-100 px-2 py-1.5 rounded">
          <LayoutTemplate size={16} /> 그룹
        </button>
        <button className="hover:bg-gray-100 p-1.5 rounded">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}
