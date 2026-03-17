import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { History, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { useProjectAuditLogs } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import { formatDate } from '../shared/lib/format';
import AppModal from '../shared/ui/AppModal';
import StatusPill from '../shared/ui/StatusPill';

export default function AuditLogsPage() {
  const { currentProject } = useWorkspace();
  const { data: logs = [] } = useProjectAuditLogs(currentProject?.id ?? null);
  const [selectedArea, setSelectedArea] = useState<'전체' | string>('전체');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const actorCount = new Set(logs.map((log) => log.actorName)).size;
  const areaCount = new Set(logs.map((log) => log.area)).size;
  const latestLog = logs[0] ?? null;
  const visibleLogs = useMemo(
    () => logs.filter((log) => selectedArea === '전체' || log.area === selectedArea),
    [logs, selectedArea],
  );
  const selectedLog = visibleLogs.find((log) => log.id === selectedLogId) ?? null;
  const areas = ['전체', ...new Set(logs.map((log) => log.area))];

  return (
    <div className="space-y-4">
      <section className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-4 pt-2">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 md:gap-x-10">
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

      <section className="bg-background pt-4">
        <div className="flex items-end justify-between gap-3 border-b border-border/70 pb-4 pt-2">
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

        <div className="grid gap-4 border-b border-border/70 py-4 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryBlock label="최근 활동" value={latestLog?.actionLabel ?? '기록 없음'} description={latestLog?.summary ?? '아직 누적된 활동이 없습니다.'} />
            <SummaryBlock label="최근 변경 시각" value={latestLog ? formatDate(latestLog.occurredAt) : '-'} description="현재 프로젝트 기준 최신 로그" />
            <SummaryBlock label="날짜 범위" value="최근 7일" description="필터 기반 탐색은 추후 백엔드 쿼리와 연결합니다." />
          </div>
          <div className="flex flex-wrap items-start gap-2">
            {areas.map((area) => (
              <Button
                key={area}
                type="button"
                variant={selectedArea === area ? 'default' : 'outline'}
                className="h-8 rounded-md px-3 text-xs"
                onClick={() => setSelectedArea(area)}
              >
                {area}
              </Button>
            ))}
          </div>
        </div>

        <Table className="border-t border-border/70">
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
            {visibleLogs.map((log) => (
              <TableRow
                key={log.id}
                className="cursor-pointer"
                onClick={() => setSelectedLogId(log.id)}
              >
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

      <AppModal
        open={Boolean(selectedLog)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedLogId(null);
          }
        }}
        title={selectedLog?.actionLabel ?? ''}
        description={selectedLog?.summary}
        size="sm"
        badges={
          selectedLog ? (
            <>
              <StatusPill tone="teal">{selectedLog.area}</StatusPill>
              <StatusPill tone="slate">{selectedLog.actorName}</StatusPill>
            </>
          ) : null
        }
        footer={
          <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setSelectedLogId(null)}>
            닫기
          </Button>
        }
      >
        {selectedLog ? (
          <div className="space-y-4">
            <MetaRow label="시각" value={formatDate(selectedLog.occurredAt)} />
            <MetaRow label="작성자" value={selectedLog.actorName} />
            <MetaRow label="업무 영역" value={selectedLog.area} />
            <MetaRow label="대상" value={selectedLog.targetLabel} />
          </div>
        ) : null}
      </AppModal>
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
    <div className="flex min-w-[106px] items-center gap-3.5 pr-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/35 text-muted-foreground">{icon}</div>
      <div>
        <div className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground">{label}</div>
        <div className="mt-1 text-xl font-semibold leading-none tracking-tight text-foreground">{value}</div>
      </div>
    </div>
  );
}

function SummaryBlock({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="border-t border-border/60 pt-3">
      <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm font-semibold text-foreground">{value}</div>
      <div className="mt-2 text-sm leading-6 text-muted-foreground">{description}</div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
