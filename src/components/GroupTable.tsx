import { ChevronDown, Plus } from 'lucide-react';
import type { GroupData } from '../types';
import { GROUP_COLORS } from '../constants';
import TableRow from './TableRow';

interface GroupTableProps {
  group: GroupData;
}

export default function GroupTable({ group }: GroupTableProps) {
  const groupHex = GROUP_COLORS[group.color];
  
  const total = group.items.length || 1;
  const doneCount = group.items.filter(i => i.status === 'done').length;
  const workingCount = group.items.filter(i => i.status === 'working').length;
  const emptyCount = group.items.filter(i => i.status === 'empty').length;

  return (
    <div className="mb-10 w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Group Header Title */}
        <div className="flex items-center gap-2 mb-2 ml-4">
          <button style={{ color: groupHex }} className="hover:bg-gray-100 p-0.5 rounded">
            <ChevronDown size={20} />
          </button>
          <h3 style={{ color: groupHex }} className="text-lg font-medium cursor-text">
            {group.title}
          </h3>
          <span className="text-sm text-gray-400 font-medium ml-2">{group.items.length} 아이템</span>
        </div>

        {/* Column Headers */}
        <div className="flex items-center h-[42px] border-y border-gray-200 bg-white text-sm text-gray-500 font-medium">
          <div className="w-[46px] border-r border-gray-200 h-full flex items-center justify-center shrink-0">
            <input type="checkbox" className="w-3.5 h-3.5 rounded-sm border-gray-300 text-blue-600" />
          </div>
          <div className="flex-1 min-w-[300px] border-r border-gray-200 h-full flex items-center px-4 shrink-0 hover:bg-gray-50 cursor-pointer">아이템</div>
          <div className="w-[120px] shrink-0 border-r border-gray-200 h-full flex items-center justify-center hover:bg-gray-50 cursor-pointer">Person</div>
          <div className="w-[140px] shrink-0 border-r border-gray-200 h-full flex items-center justify-center hover:bg-gray-50 cursor-pointer">Status</div>
          <div className="w-[120px] shrink-0 border-r border-gray-200 h-full flex items-center justify-center hover:bg-gray-50 cursor-pointer">Date</div>
          <div className="w-[50px] shrink-0 h-full flex items-center justify-center cursor-pointer hover:bg-gray-50"><Plus size={16} /></div>
        </div>

        {/* Rows */}
        <div className="flex flex-col relative z-0">
          {group.items.map(item => (
            <TableRow key={item.id} item={item} groupColor={group.color} />
          ))}
          {/* Add Item Row */}
          <div className="flex items-center h-[42px] border-b border-gray-200 bg-white group">
            <div className="absolute left-0 w-1.5 h-[42px] z-10" style={{ backgroundColor: groupHex }}></div>
            <div className="w-[40px] h-full border-r border-gray-200 ml-[6px] shrink-0 flex items-center justify-center bg-[#f5f6f8]">
              <input type="checkbox" className="w-3.5 h-3.5 rounded-sm border-gray-300 opacity-0 group-hover:opacity-100" />
            </div>
            <div className="flex-1 h-full px-4 flex items-center text-sm text-gray-400 cursor-text hover:bg-gray-50 border-r border-gray-200 transition-colors">
              + 아이템 추가
            </div>
            <div className="w-[120px] border-r border-gray-200 h-full shrink-0"></div>
            <div className="w-[140px] border-r border-gray-200 h-full shrink-0 bg-[#f5f6f8] group-hover:bg-white transition-colors"></div>
            <div className="w-[120px] border-r border-gray-200 h-full shrink-0"></div>
            <div className="w-[50px] h-full shrink-0"></div>
          </div>
        </div>

        {/* Footer Progress Bar */}
        {group.items.length > 0 && (
          <div className="flex items-center h-[42px]">
            <div className="w-[46px] shrink-0"></div>
            <div className="flex-1 min-w-[300px] shrink-0"></div>
            <div className="w-[120px] shrink-0 border-r border-gray-200 h-full"></div>
            <div className="w-[140px] shrink-0 border-r border-gray-200 h-full flex flex-col justify-end pb-1.5 px-[2px]">
              <div className="h-4 w-full flex overflow-hidden">
                {doneCount > 0 && <div style={{ width: `${(doneCount/total)*100}%` }} className="h-full bg-[#00c875]"></div>}
                {workingCount > 0 && <div style={{ width: `${(workingCount/total)*100}%` }} className="h-full bg-[#fdab3d]"></div>}
                {emptyCount > 0 && <div style={{ width: `${(emptyCount/total)*100}%` }} className="h-full bg-[#c4c4c4]"></div>}
              </div>
            </div>
            <div className="w-[120px] shrink-0 h-full"></div>
            <div className="w-[50px] shrink-0 h-full"></div>
          </div>
        )}
      </div>
    </div>
  );
}