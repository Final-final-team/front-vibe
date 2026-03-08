import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { Option } from '../types';

interface TokenProps {
  value: string;
  placeholder: string;
  type?: 'select' | 'text' | 'date';
  options?: Option[];
  onChange: (val: string) => void;
  icon?: React.ReactNode;
}

const Token: React.FC<TokenProps> = ({ value, placeholder, type = 'text', options = [], onChange, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setInputValue(value); }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (type === 'text' || type === 'date') onChange(inputValue);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inputValue, onChange, type]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onChange(inputValue);
      setIsOpen(false);
    }
  };

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const displayValue = type === 'select' ? options.find(o => o.id === value)?.label : value;

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className={`flex items-center justify-between w-full cursor-pointer px-4 py-3.5 rounded-xl border transition-colors ${
          isOpen ? 'border-blue-500 bg-white shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-gray-300'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 overflow-hidden text-base">
          {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
          <span className={`truncate font-medium ${displayValue ? 'text-gray-800' : 'text-gray-400'}`}>
            {displayValue || placeholder}
          </span>
        </div>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {type === 'select' && (
            <div className="max-h-64 overflow-y-auto">
              {options.length > 0 ? (
                <div className="p-2">
                  {options.map((opt) => (
                    <div
                      key={opt.id}
                      className="px-4 py-3 text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
                      onClick={() => handleSelect(opt.id)}
                    >
                      {opt.label}
                      {value === opt.id && <Check size={20} className="text-blue-600" />}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-5 text-sm text-gray-500 text-center">항목이 없습니다.</div>
              )}
            </div>
          )}

          {(type === 'text' || type === 'date') && (
            <div className="flex flex-col gap-3 p-3">
              <input
                ref={inputRef}
                type={type}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button 
                onClick={() => { onChange(inputValue); setIsOpen(false); }}
                className="bg-blue-600 w-full text-white px-4 py-3.5 rounded-lg hover:bg-blue-700 text-base font-medium"
              >
                확인
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Token;