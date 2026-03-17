import { useMemo, useState } from 'react';
import { MailPlus, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { useProjectMembers, useProjectRoles } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import { formatDate } from '../shared/lib/format';
import Button from '../shared/ui/Button';
import Dialog from '../shared/ui/Dialog';
import MetricCard from '../shared/ui/MetricCard';
import StatusPill from '../shared/ui/StatusPill';

const inviteToneMap = {
  ACTIVE: 'green',
  INVITED: 'blue',
  EXPIRED: 'amber',
  DECLINED: 'rose',
} as const;

const inviteLabelMap = {
  ACTIVE: '참여중',
  INVITED: '초대 대기',
  EXPIRED: '초대 만료',
  DECLINED: '초대 거절',
} as const;

export default function MembersPage() {
  const { currentProject } = useWorkspace();
  const { data: members = [] } = useProjectMembers(currentProject?.id ?? null);
  const { data: roles = [] } = useProjectRoles(currentProject?.id ?? null);
  const [invitePlanOpen, setInvitePlanOpen] = useState(false);

  const mergedMembers = useMemo(() => members, [members]);

  const invitedCount = mergedMembers.filter((member) => member.inviteStatus === 'INVITED').length;
  const activeCount = mergedMembers.filter((member) => member.inviteStatus === 'ACTIVE').length;
  const pendingCount = mergedMembers.filter((member) => member.inviteStatus !== 'ACTIVE').length;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        <MetricCard
          label="활성 멤버"
          value={`${activeCount}명`}
          hint="프로젝트에 실제 참여 중인 멤버"
          icon={<Users size={18} />}
        />
        <MetricCard
          label="대기 초대"
          value={`${invitedCount}건`}
          hint="수락을 기다리는 초대"
          icon={<MailPlus size={18} />}
        />
        <MetricCard
          label="역할 연결"
          value={`${roles.length}개`}
          hint="현재 프로젝트 역할 카탈로그"
          icon={<ShieldCheck size={18} />}
        />
        <MetricCard
          label="추가 확인"
          value={`${pendingCount}명`}
          hint="만료 또는 거절 상태 포함"
          icon={<UserCheck size={18} />}
        />
      </section>

      <div className="space-y-8">
        <section className="border-t border-border/70 pt-4">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">프로젝트 멤버</h2>
              <p className="mt-1 text-sm text-muted-foreground">초대 상태와 프로젝트 내 역할 연결을 한 화면에서 확인합니다.</p>
            </div>
            <Button variant="secondary" onClick={() => setInvitePlanOpen(true)}>
              멤버 초대
            </Button>
          </div>
          <div className="mb-5 grid gap-3 border-y border-border/60 py-4 lg:grid-cols-3">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">1. 멤버 선택</div>
              <div className="mt-2 text-sm text-foreground">초대 상태와 소속 팀을 확인하고 프로젝트 참여 대상을 고릅니다.</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">2. 역할 연결</div>
              <div className="mt-2 text-sm text-foreground">멤버에게 직접 권한을 주지 않고 역할을 연결합니다.</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">3. 권한 반영</div>
              <div className="mt-2 text-sm text-foreground">역할이 가진 권한 묶음이 멤버에게 그대로 적용됩니다.</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[2.1fr_1fr_1.2fr_1.5fr_1fr] border-b border-gray-200 pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                <div>멤버</div>
                <div>상태</div>
                <div>소속 팀</div>
                <div>연결 역할</div>
                <div>최근 활동</div>
              </div>
              <div className="divide-y divide-gray-100">
                {mergedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="grid grid-cols-[2.1fr_1fr_1.2fr_1.5fr_1fr] gap-4 py-4 text-sm"
                  >
                    <div>
                      <div className="font-semibold text-gray-900">{member.name}</div>
                      <div className="mt-1 text-gray-500">{member.email}</div>
                    </div>
                    <div className="flex items-center">
                      <StatusPill tone={inviteToneMap[member.inviteStatus]}>
                        {inviteLabelMap[member.inviteStatus]}
                      </StatusPill>
                    </div>
                    <div className="flex items-center text-gray-600">{member.team}</div>
                    <div className="flex flex-wrap gap-2">
                      {member.roleIds.map((roleId) => {
                        const role = roles.find((item) => item.id === roleId);
                        return (
                          <span
                            key={roleId}
                            className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                            style={{ backgroundColor: role?.color ?? '#6b7280' }}
                          >
                            {role?.name ?? roleId}
                          </span>
                        );
                      })}
                    </div>
                    <div className="flex items-center text-gray-500">
                      {member.lastActiveAt ? formatDate(member.lastActiveAt) : '아직 미참여'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Dialog
        open={invitePlanOpen}
        title="멤버 초대 기능 준비 중"
        description="초대 발송, 토큰 검증, 수락/만료 처리 플로우는 사용자/이메일 도메인이 정리된 뒤 연결합니다."
        confirmLabel="확인"
        onCancel={() => setInvitePlanOpen(false)}
        onConfirm={() => setInvitePlanOpen(false)}
      >
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-4 text-sm leading-6 text-muted-foreground">
          이 버튼은 이후 초대 모달, 이메일 발송, 만료/거절 재초대 흐름까지 연결될 예정입니다. 지금 단계에서는 멤버 현황과 상태 모델만 먼저 검증합니다.
          </div>
      </Dialog>
    </div>
  );
}
