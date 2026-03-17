import type { ReactNode } from 'react';
import { History, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useProjectAuditLogs } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import { formatDate } from '../shared/lib/format';
import StatusPill from '../shared/ui/StatusPill';

export default function AuditLogsPage() {
  const { currentProject } = useWorkspace();
  const { data: logs = [] } = useProjectAuditLogs(currentProject?.id ?? null);

  const actorCount = new Set(logs.map((log) => log.actorName)).size;
  const areaCount = new Set(logs.map((log) => log.area)).size;

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-end justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex flex-wrap items-center gap-5">
          <InlineStat label="변경 기록" value={`${logs.length}건`} icon={<History size={15} />} />
          <InlineStat label="작성자" value={`${actorCount}명`} icon={<ShieldCheck size={15} />} />
          <InlineStat label="업무 영역" value={`${areaCount}개`} icon={<SlidersHorizontal size={15} />} />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-md">{currentProject?.code ?? '로그'}</Badge>
          <Badge variant="outline" className="rounded-md">운영자 전용</Badge>
          <span>최근 변경 이력</span>
        </div>
      </section>

      <section className="border-t border-border/70 bg-background">
        <div className="flex items-end justify-between gap-3 border-b border-border/70 pb-3 pt-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">감사 로그</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              역할 정책, 멤버십, 검토 처리처럼 운영자가 확인해야 하는 최근 변경 이력을 모아서 보여줍니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="rounded-md">읽기 전용</Badge>
            <Badge variant="outline" className="rounded-md">{logs.length}행</Badge>
          </div>
        </div>

        <Table className="mt-4 border-t border-border/70">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>시각</TableHead>
              <TableHead>작성자</TableHead>
              <TableHead>작업</TableHead>
              <TableHead>업무 영역</TableHead>
              <TableHead>대상</TableHead>
              <TableHead>요약</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm text-muted-foreground">{formatDate(log.occurredAt)}</TableCell>
                <TableCell className="font-medium text-foreground">{log.actorName}</TableCell>
                <TableCell>
                  <StatusPill tone="slate">{log.actionLabel}</StatusPill>
                </TableCell>
                <TableCell>
                  <StatusPill tone="teal">{log.area}</StatusPill>
                </TableCell>
                <TableCell className="text-sm text-foreground">{log.targetLabel}</TableCell>
                <TableCell className="max-w-[420px] text-sm leading-6 text-muted-foreground">{log.summary}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}

function InlineStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <div className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground">{label}</div>
        <div className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">{value}</div>
      </div>
    </div>
  );
}
