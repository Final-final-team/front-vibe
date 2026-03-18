import { ShieldCheck, History, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Input } from '../components/ui/input';
import { useProjectAuditLogs } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import { formatDate } from '../shared/lib/format';
import StatusPill from '../shared/ui/StatusPill';

export default function AuditLogsPage() {
  const { currentProject } = useWorkspace();
  const projectId = currentProject?.id ?? null;
  const { data: auditLogs = [] } = useProjectAuditLogs(projectId);
  const [query, setQuery] = useState('');

  const filteredLogs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return auditLogs;
    }

    return auditLogs.filter((log) =>
      [log.actorName, log.actionLabel, log.targetLabel, log.area, log.summary]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  }, [auditLogs, query]);

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-border/70 bg-[var(--surface-panel)] px-6 py-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">감사 로그</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              프로젝트 전역의 역할 변경과 검토 이력을 시간순으로 확인합니다.
            </p>
          </div>
          <div className="relative w-full max-w-sm">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="행위자, 액션, 대상 검색"
              className="h-10 rounded-xl pl-9"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-6 text-sm">
          <InlineKpi label="전체 로그" value={`${auditLogs.length}건`} icon={<History size={15} />} />
          <InlineKpi label="현재 표시" value={`${filteredLogs.length}건`} icon={<ShieldCheck size={15} />} />
          <InlineKpi label="프로젝트" value={currentProject?.code ?? '-'} icon={<ShieldCheck size={15} />} />
        </div>
      </section>

      <section className="rounded-[30px] border border-border/70 bg-white/78 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
        <div className="grid grid-cols-[140px_120px_140px_minmax(0,1fr)] gap-4 border-b border-border/70 px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <div>시각</div>
          <div>영역</div>
          <div>행위자</div>
          <div>내용</div>
        </div>

        <div className="divide-y divide-border/70">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <article key={log.id} className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[140px_120px_140px_minmax(0,1fr)] md:gap-4">
                <div className="text-sm text-muted-foreground">{formatDate(log.occurredAt)}</div>
                <div>
                  <StatusPill tone={log.area === '역할 정책' ? 'blue' : 'teal'}>{log.area}</StatusPill>
                </div>
                <div className="text-sm font-medium text-foreground">{log.actorName}</div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{log.actionLabel}</span>
                    <span className="text-sm text-muted-foreground">{log.targetLabel}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{log.summary}</p>
                </div>
              </article>
            ))
          ) : (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              표시할 감사 로그가 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function InlineKpi({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-muted-foreground">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border border-border/70 bg-white/80 text-foreground shadow-sm">
        {icon}
      </span>
      <span className="text-sm">
        <span className="font-medium text-foreground">{value}</span> {label}
      </span>
    </div>
  );
}
