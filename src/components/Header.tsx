import { Bot, ChevronDown, MessageCircle, PlayCircle, Star, User, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex justify-between items-center px-6 pt-5 pb-3 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <h1 className="text-[28px] font-medium tracking-tight text-[#323338]">Start from scratch</h1>
        <button className="text-gray-400 hover:text-gray-600 mt-1"><ChevronDown size={20} /></button>
        <button className="ml-2 text-gray-400 hover:text-yellow-500"><Star size={18} /></button>
      </div>
      
      <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
        <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors">
          <span className="text-blue-500"><PlayCircle size={16} /></span> 사이드킥
        </button>
        <div className="w-px h-4 bg-gray-300"></div>
        <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors">
          <Zap size={16} /> 연동
        </button>
        <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1.5 rounded transition-colors">
          <Bot size={16} /> 자동화 / 1
        </button>
        <div className="w-px h-4 bg-gray-300"></div>
        <button className="hover:bg-gray-100 p-1.5 rounded"><MessageCircle size={18} /></button>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white"><User size={18} /></div>
          <button className="border border-gray-300 rounded px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
            <User size={14} /> 초대하기
          </button>
        </div>
      </div>
    </header>
  );
}