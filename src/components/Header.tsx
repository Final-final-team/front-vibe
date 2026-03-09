import { ChevronDown } from 'lucide-react';

type Props = {
  title?: string;
  subtitle?: string;
  projectName?: string;
  projectCode?: string;
  projects?: Array<{ id: string; name: string; code: string }>;
  selectedProjectId?: string | null;
  onProjectChange?: (projectId: string) => void;
};

export default function Header({
  title = 'Start from scratch',
  subtitle,
  projectName,
  projectCode,
  projects = [],
  selectedProjectId,
  onProjectChange,
}: Props) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="flex flex-col gap-4 px-6 pb-4 pt-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-[28px] font-medium tracking-tight text-[#323338]">{title}</h1>
            <button className="mt-1 text-gray-400 hover:text-gray-600">
              <ChevronDown size={20} />
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {projectName && (
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                <span>{projectName}</span>
                {projectCode && <span className="text-blue-500">· {projectCode}</span>}
              </div>
            )}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-600">
          {projects.length > 0 && onProjectChange && (
            <label className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
              <span className="text-gray-400">Project</span>
              <select
                value={selectedProjectId ?? ''}
                onChange={(event) => onProjectChange(event.target.value)}
                className="border-0 bg-transparent pr-2 text-sm font-semibold text-gray-900 outline-none"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.code})
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>
    </header>
  );
}
