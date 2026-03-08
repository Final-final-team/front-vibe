import { MessageSquare, LayoutTemplate, Plus, User } from 'lucide-react';
import type { ItemRow, GroupColor } from '../types';
import { GROUP_COLORS, STATUS_STYLES, STATUS_LABELS, USERS } from '../constants';

interface TableRowProps {
  item: ItemRow;
  groupColor: GroupColor;
}

export default function TableRow({ item, groupColor }: TableRowProps) {
  const hasDetails = item.where || item.how || item.why;

  return (
    <div className="flex items-center h-[42px] border-b border-gray-200 hover:bg-gray-50 group bg-white transition-colors relative">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 z-10" style={{ backgroundColor: GROUP_COLORS[groupColor] }}></div>
      
      <div className="w-[40px] h-full flex items-center justify-center border-r border-gray-200 ml-[6px] shrink-0 bg-[#f5f6f8]">
        <input type="checkbox" className="w-3.5 h-3.5 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500" />
      </div>
      
      <div className="flex-1 min-w-[300px] h-full flex items-center justify-between px-4 border-r border-gray-200 group-hover:bg-gray-50">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-[14px] text-gray-800 outline-none truncate" contentEditable suppressContentEditableWarning>
            {item.name}
          </span>
          {hasDetails && (
            <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded border border-blue-100 shrink-0 font-medium">
              5W1H
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button className="text-gray-400 hover:text-blue-500 p-0.5 rounded hover:bg-gray-200">
            <LayoutTemplate size={14} />
          </button>
          <button className="text-gray-400 hover:text-blue-500 p-0.5 rounded hover:bg-gray-200 relative">
            <MessageSquare size={14} />
            {item.subItem && item.subItem.hasUpdates && (
              <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                {item.subItem.count}
              </span>
            )}
          </button>
        </div>
      </div>
      
      <div className="w-[120px] shrink-0 h-full flex items-center justify-center border-r border-gray-200 bg-white">
        {item.person === 'filled' ? (
          <div className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs" title={USERS.find(u => u.id === item.who)?.label}>
            <User size={15} />
          </div>
        ) : (
          <div className="w-7 h-7 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center text-gray-300 hover:border-blue-500 hover:text-blue-500 cursor-pointer">
            <User size={15} />
          </div>
        )}
      </div>

      <div className="w-[140px] shrink-0 h-full border-r border-gray-200 p-[1px] bg-white">
        <div className={`w-full h-full flex items-center justify-center text-[13px] cursor-pointer hover:opacity-90 ${STATUS_STYLES[item.status]}`}>
          {STATUS_LABELS[item.status]}
        </div>
      </div>

      <div className="w-[120px] shrink-0 h-full flex items-center justify-center border-r border-gray-200 text-[13px] text-gray-600 bg-white">
        {item.date}
      </div>

      <div className="w-[50px] shrink-0 h-full flex items-center justify-center text-gray-300 hover:bg-gray-100 cursor-pointer bg-white">
        <Plus size={16} />
      </div>
    </div>
  );
}