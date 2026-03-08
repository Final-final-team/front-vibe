import { useState } from 'react';
import { Briefcase, Calendar as CalendarIcon, Check, MapPin, Plus, Settings, Target, User, X } from 'lucide-react';
import Token from './Token';
import type { ItemRow } from '../types';
import { TASKS, USERS } from '../constants';

interface TaskAssignmentModalProps {
  onClose: () => void;
  onAssign: (taskData: Partial<ItemRow>) => void;
}

export default function TaskAssignmentModal({ onClose, onAssign }: TaskAssignmentModalProps) {
  const [who, setWho] = useState('');
  const [what, setWhat] = useState('');
  const [when, setWhen] = useState('');
  const [where, setWhere] = useState('');
  const [how, setHow] = useState('');
  const [why, setWhy] = useState('');

  const [showWhere, setShowWhere] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  const isComplete = who && what && when;

  const handleSubmit = () => {
    if (!isComplete) return;
    
    let formattedDate = when;
    if (when) {
      const d = new Date(when);
      formattedDate = `${d.getMonth() + 1}월 ${d.getDate()}일`;
    }

    const taskName = TASKS.find(t => t.id === what)?.label || what;

    onAssign({
      name: taskName,
      person: 'filled',
      date: formattedDate,
      status: 'empty',
      who,
      where,
      how,
      why
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[560px] max-w-[560px] flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 relative">
        
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">새 아이템 할당</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full p-2 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          
          <div className="text-sm font-bold text-blue-600 uppercase tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span> 
            필수 항목 (5W1H)
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 shrink-0 text-[15px] font-bold text-gray-500 text-right">누가</div>
              <div className="flex-1">
                <Token type="select" options={USERS} value={who} onChange={setWho} placeholder="인원 선택" icon={<User size={16} />} />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-16 shrink-0 text-[15px] font-bold text-gray-500 text-right">언제</div>
              <div className="flex-1">
                <Token type="date" value={when} onChange={setWhen} placeholder="기한 선택" icon={<CalendarIcon size={16} />} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 shrink-0 text-[15px] font-bold text-gray-500 text-right">무엇을</div>
              <div className="flex-1">
                <Token type="select" options={TASKS} value={what} onChange={setWhat} placeholder="업무 선택" icon={<Target size={16} />} />
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200 my-5"></div>

          <div className="text-sm font-bold text-gray-400 uppercase tracking-wide flex items-center gap-2">
            선택 사항 (구체화)
          </div>

          <div className="space-y-4">
            {showWhere && (
              <div className="flex items-center gap-4">
                <div className="w-16 shrink-0 text-[15px] font-bold text-gray-500 text-right">어디서</div>
                <div className="flex-1 flex items-center gap-2">
                  <Token type="text" value={where} onChange={setWhere} placeholder="장소 입력" icon={<MapPin size={16} />} />
                  <button onClick={() => { setShowWhere(false); setWhere(''); }} className="text-gray-300 hover:text-red-500 p-1 shrink-0"><X size={18} /></button>
                </div>
              </div>
            )}
            
            {showHow && (
              <div className="flex items-center gap-4">
                <div className="w-16 shrink-0 text-[15px] font-bold text-gray-500 text-right">어떻게</div>
                <div className="flex-1 flex items-center gap-2">
                  <Token type="text" value={how} onChange={setHow} placeholder="방법 입력" icon={<Settings size={16} />} />
                  <button onClick={() => { setShowHow(false); setHow(''); }} className="text-gray-300 hover:text-red-500 p-1 shrink-0"><X size={18} /></button>
                </div>
              </div>
            )}
            
            {showWhy && (
              <div className="flex items-center gap-4">
                <div className="w-16 shrink-0 text-[15px] font-bold text-gray-500 text-right">왜</div>
                <div className="flex-1 flex items-center gap-2">
                  <Token type="text" value={why} onChange={setWhy} placeholder="목적 입력" icon={<Target size={16} />} />
                  <button onClick={() => { setShowWhy(false); setWhy(''); }} className="text-gray-300 hover:text-red-500 p-1 shrink-0"><X size={18} /></button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pl-[80px]">
              {!showWhere && <button onClick={() => setShowWhere(true)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-600 text-[13px] font-medium rounded-lg hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-colors"><Plus size={14} /> 어디서</button>}
              {!showHow && <button onClick={() => setShowHow(true)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-600 text-[13px] font-medium rounded-lg hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-colors"><Plus size={14} /> 어떻게</button>}
              {!showWhy && <button onClick={() => setShowWhy(true)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-600 text-[13px] font-medium rounded-lg hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-colors"><Plus size={14} /> 왜</button>}
            </div>
          </div>
          
          <div className="pb-12"></div>
        </div>

        <div className="bg-gray-50 border-t border-gray-100 px-6 py-5 rounded-b-2xl flex flex-col gap-3 shrink-0">
          <button 
            onClick={handleSubmit}
            disabled={!isComplete}
            className={`w-full py-3 rounded-xl text-[15px] font-bold text-white transition-all shadow-sm flex items-center justify-center gap-2 ${isComplete ? 'bg-blue-600 hover:bg-blue-700 hover:shadow' : 'bg-gray-300 cursor-not-allowed'}`}
          >
            <Check size={18} /> 아이템 추가
          </button>
        </div>
      </div>
    </div>
  );
}