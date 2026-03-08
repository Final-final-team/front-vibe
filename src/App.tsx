import { useState } from 'react';
import { LayoutTemplate, MoreHorizontal, Plus } from 'lucide-react';
import type { GroupData, ItemRow } from './types';
import Header from './components/Header';
import BoardToolbar from './components/BoardToolbar';
import GroupTable from './components/GroupTable';
import TaskAssignmentModal from './components/TaskAssignmentModal';

export default function App() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const [groups, setGroups] = useState<GroupData[]>([
    {
      id: 'g1',
      title: '새 그룹',
      color: 'red',
      items: []
    },
    {
      id: 'g2',
      title: 'Group Title',
      color: 'purple',
      items: [
        { id: 'i1', name: '새로운 아이템', subItem: { count: 1, hasUpdates: true }, person: 'filled', status: 'done', date: '2월 26' },
        { id: 'i2', name: 'Item 1', person: 'empty', status: 'working', date: '11월 7, 2021' },
        { id: 'i3', name: 'Item 2', person: 'empty', status: 'done', date: '11월 7, 2021' },
        { id: 'i4', name: 'Item 3', person: 'empty', status: 'empty', date: '11월 12, 2021' },
        { id: 'i5', name: 'ㅁㅇㅁㅇ', person: 'empty', status: 'empty', date: '' },
        { id: 'i6', name: '새로운 아이템', person: 'filled', status: 'empty', date: '' },
      ]
    }
  ]);

  const handleAssignTask = (taskData: Partial<ItemRow>) => {
    const newItem: ItemRow = {
      id: `new-${Date.now()}`,
      name: taskData.name || '새 아이템',
      person: taskData.person || 'empty',
      status: taskData.status || 'empty',
      date: taskData.date || '',
      who: taskData.who,
      where: taskData.where,
      how: taskData.how,
      why: taskData.why,
    };

    setGroups(prev => {
      const newGroups = [...prev];
      newGroups[0] = { ...newGroups[0], items: [newItem, ...newGroups[0].items] };
      return newGroups;
    });

    setIsTaskModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col overflow-hidden">
      
      <Header />

      <div className="flex items-center px-6 border-b border-gray-200 overflow-x-auto hide-scrollbar">
        <button className="px-1 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600 whitespace-nowrap flex items-center gap-1.5 mr-6 group">
          <LayoutTemplate size={16} /> 메인 테이블 <MoreHorizontal size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
        {['Dashboard', '차트', '간트', '테이블', 'Doc', '파일 갤러리', '양식'].map(tab => (
          <button key={tab} className="px-1 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 border-b-2 border-transparent whitespace-nowrap mr-6">
            {tab}
          </button>
        ))}
        <button className="p-1 hover:bg-gray-100 rounded text-gray-500"><Plus size={18} /></button>
      </div>

      <BoardToolbar onOpenModal={() => setIsTaskModalOpen(true)} />

      <div className="flex-1 overflow-y-auto px-6 pb-20">
        {groups.map(group => (
          <GroupTable key={group.id} group={group} />
        ))}
      </div>

      {isTaskModalOpen && (
        <TaskAssignmentModal 
          onClose={() => setIsTaskModalOpen(false)} 
          onAssign={handleAssignTask} 
        />
      )}
    </div>
  );
}