import { ArrowUpDown, ChevronDown, Filter, Search } from 'lucide-react';

interface BoardToolbarProps {
  onOpenModal: () => void;
  primaryLabel?: string;
  filterLabels?: string[];
  contextLabel?: string;
}

export default function BoardToolbar({
  onOpenModal,
  primaryLabel = '새로운 아이템 (5W1H 할당)',
  filterLabels = [],
  contextLabel,
}: BoardToolbarProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-gray-200 bg-white px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenModal}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          {primaryLabel}
        </button>
        {contextLabel && (
          <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
            {contextLabel}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:min-w-[520px] lg:flex-row lg:items-center lg:justify-end">
        <label className="flex min-w-[220px] items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
          <Search size={16} />
          <input
            type="text"
            placeholder="현재 뷰에서 검색"
            className="w-full border-0 bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          {filterLabels.map((label) => (
            <button
              key={label}
              type="button"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 transition hover:border-gray-300 hover:bg-gray-50"
            >
              <Filter size={14} />
              {label}
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          ))}
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 transition hover:border-gray-300 hover:bg-gray-50"
          >
            <ArrowUpDown size={14} />
            정렬
          </button>
        </div>
      </div>
    </div>
  );
}
