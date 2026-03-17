import { useState } from 'react';
import { MailPlus, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { useProjectMembers, useProjectRoles } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import { formatDate } from '../shared/lib/format';
import AppModal from '../shared/ui/AppModal';
import MetricCard from '../shared/ui/MetricCard';
import StatusPill from '../shared/ui/StatusPill';
import { Button } from '../components/ui/button';

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
  const [profileMemberId, setProfileMemberId] = useState<number | null>(null);
  const [assignmentMemberId, setAssignmentMemberId] = useState<number | null>(null);
  const [draftRoleIds, setDraftRoleIds] = useState<string[]>([]);

  const profileMember = members.find((member) => member.id === profileMemberId) ?? null;
  const assignmentMember = members.find((member) => member.id === assignmentMemberId) ?? null;

  const invitedCount = members.filter((member) => member.inviteStatus === 'INVITED').length;
  const activeCount = members.filter((member) => member.inviteStatus === 'ACTIVE').length;
  const pendingCount = members.filter((member) => member.inviteStatus !== 'ACTIVE').length;
  const profileRoles = roles.filter((role) => profileMember?.roleIds.includes(role.id));
  const profilePermissionKeys = [...new Set(profileRoles.flatMap((role) => role.permissionKeys))];

  const effectiveRoleIds = draftRoleIds.length > 0 ? draftRoleIds : assignmentMember?.roleIds ?? [];
  const effectiveRoles = roles.filter((role) => effectiveRoleIds.includes(role.id));

  function toggleRole(roleId: string) {
    setDraftRoleIds((current) =>
      current.includes(roleId) ? current.filter((item) => item !== roleId) : [...current, roleId],
    );
  }

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
              <p className="mt-1 text-sm text-muted-foreground">멤버에게는 역할만 연결하고, 역할이 가진 권한 묶음이 그대로 반영됩니다.</p>
            </div>
            <Button variant="outline" className="rounded-xl px-4" onClick={() => setInvitePlanOpen(true)}>
              멤버 초대
            </Button>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[2fr_0.9fr_1.1fr_1.7fr_1fr_0.9fr] border-b border-gray-200 pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                <div>멤버</div>
                <div>상태</div>
                <div>소속 팀</div>
                <div>연결 역할</div>
                <div>최근 활동</div>
                <div className="text-right">관리</div>
              </div>
              <div className="divide-y divide-gray-100">
                {members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setProfileMemberId(member.id)}
                    className="grid w-full grid-cols-[2fr_0.9fr_1.1fr_1.7fr_1fr_0.9fr] gap-4 py-4 text-left text-sm transition hover:bg-muted/10"
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
                    <div className="flex items-center justify-end">
                      <Button
                        variant="ghost"
                        className="h-9 rounded-xl px-3 text-sm font-medium"
                        onClick={(event) => {
                          event.stopPropagation();
                          setAssignmentMemberId(member.id);
                          setDraftRoleIds(member.roleIds);
                        }}
                      >
                        역할 부여
                      </Button>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <AppModal
        open={Boolean(profileMember)}
        onOpenChange={(open) => {
          if (!open) {
            setProfileMemberId(null);
          }
        }}
        title={profileMember ? `${profileMember.name} 프로필` : ''}
        description="멤버 시점에서는 내가 가진 역할과, 그 역할이 허용한 권한만 확인할 수 있습니다."
        badges={
          profileMember ? (
            <>
              <StatusPill tone={inviteToneMap[profileMember.inviteStatus]}>{inviteLabelMap[profileMember.inviteStatus]}</StatusPill>
              <StatusPill tone="teal">{profileMember.team}</StatusPill>
            </>
          ) : null
        }
        side={
          profileMember ? (
            <div className="space-y-5">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">역할 기반 접근</div>
                <div className="mt-3 rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm leading-6 text-muted-foreground">
                  멤버는 역할 / 권한 화면에 직접 접근하지 않고, 자기에게 연결된 역할이 허용한 권한 결과만 확인합니다.
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">현재 연결 역할</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profileRoles.map((role) => (
                    <span
                      key={role.id}
                      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: role.color }}
                    >
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null
        }
        footer={
          <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setProfileMemberId(null)}>
            닫기
          </Button>
        }
        sideClassName="lg:max-w-[340px]"
      >
        {profileMember ? (
          <div className="space-y-5">
            <div className="grid gap-4 border-b border-border/70 pb-5 lg:grid-cols-2">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">멤버 정보</div>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span>이메일</span>
                    <span className="font-medium text-foreground">{profileMember.email}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span>소속 팀</span>
                    <span className="font-medium text-foreground">{profileMember.team}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span>최근 활동</span>
                    <span className="font-medium text-foreground">
                      {profileMember.lastActiveAt ? formatDate(profileMember.lastActiveAt) : '아직 미참여'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">허용 권한 수</div>
                <div className="mt-3 rounded-2xl border border-border/70 bg-muted/10 px-4 py-4">
                  <div className="text-3xl font-semibold tracking-tight text-foreground">{profilePermissionKeys.length}</div>
                  <div className="mt-2 text-sm text-muted-foreground">역할이 허용한 실제 권한</div>
                </div>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">허용 권한</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {profilePermissionKeys.map((permissionKey) => (
                  <StatusPill key={permissionKey} tone="slate">
                    {buildPermissionLabel(permissionKey)}
                  </StatusPill>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </AppModal>

      <AppModal
        open={invitePlanOpen}
        onOpenChange={setInvitePlanOpen}
        title="멤버 초대 기능 준비 중"
        description="초대 발송, 토큰 검증, 수락/만료 처리 플로우는 사용자/이메일 도메인이 정리된 뒤 연결합니다."
        badges={
          <>
            <StatusPill tone="blue">초대 플로우</StatusPill>
            <StatusPill tone="slate">추후 구현 예정</StatusPill>
          </>
        }
        footer={
          <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setInvitePlanOpen(false)}>
            닫기
          </Button>
        }
      >
        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-4 text-sm leading-6 text-muted-foreground">
          이 버튼은 이후 초대 모달, 이메일 발송, 만료/거절 재초대 흐름까지 연결될 예정입니다. 지금 단계에서는 멤버 현황과 상태 모델만 먼저 검증합니다.
        </div>
      </AppModal>

      <AppModal
        open={Boolean(assignmentMember)}
        onOpenChange={(open) => {
          if (!open) {
            setAssignmentMemberId(null);
            setDraftRoleIds([]);
          }
        }}
        title={assignmentMember ? `${assignmentMember.name} 역할 부여` : ''}
        description="멤버에게 직접 권한을 주지 않고 역할만 부여합니다. 권한 설계와 수정은 역할 / 권한 화면에서 관리합니다."
        badges={
          assignmentMember ? (
            <>
              <StatusPill tone={inviteToneMap[assignmentMember.inviteStatus]}>{inviteLabelMap[assignmentMember.inviteStatus]}</StatusPill>
              <StatusPill tone="teal">{assignmentMember.team}</StatusPill>
              <StatusPill tone="purple">{effectiveRoles.length}개 역할</StatusPill>
            </>
          ) : null
        }
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">실제 저장 API 연결은 추후 구현 예정입니다.</div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setAssignmentMemberId(null)}>
                닫기
              </Button>
              <Button type="button" className="rounded-xl px-4" onClick={() => setAssignmentMemberId(null)}>
                역할 적용
              </Button>
            </div>
          </div>
        }
      >
        {assignmentMember ? (
          <div className="space-y-5">
            <div className="grid gap-4 border-b border-border/70 pb-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">멤버 정보</div>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span>이메일</span>
                    <span className="font-medium text-foreground">{assignmentMember.email}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span>소속 팀</span>
                    <span className="font-medium text-foreground">{assignmentMember.team}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span>최근 활동</span>
                    <span className="font-medium text-foreground">
                      {assignmentMember.lastActiveAt ? formatDate(assignmentMember.lastActiveAt) : '아직 미참여'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">현재 연결 역할</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {assignmentMember.roleIds.map((roleId) => {
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
              </div>
            </div>

            <div>
              <div className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">역할 카탈로그</div>
              <div className="space-y-3">
                {roles.map((role) => {
                  const active = draftRoleIds.includes(role.id);

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={[
                        'w-full rounded-2xl border px-4 py-4 text-left transition',
                        active
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-border/70 hover:border-border',
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-foreground">{role.name}</span>
                            <StatusPill tone={active ? 'blue' : 'slate'}>{active ? '선택됨' : '미선택'}</StatusPill>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{role.description}</p>
                        </div>
                        <div className="text-xs font-semibold text-muted-foreground">{role.permissionKeys.length}개 권한</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </AppModal>
    </div>
  );
}

function buildPermissionLabel(permissionKey: string) {
  return permissionKey
    .split('_')
    .map((token) => {
      switch (token) {
        case 'PROJECT':
          return '프로젝트';
        case 'MEMBER':
          return '멤버';
        case 'INVITE':
          return '초대';
        case 'ROLE':
          return '역할';
        case 'ASSIGN':
          return '할당';
        case 'MANAGE':
          return '관리';
        case 'PERMISSION':
          return '권한';
        case 'BIND':
          return '연결';
        case 'MILESTONE':
          return '마일스톤';
        case 'TASK':
          return '업무';
        case 'EDIT':
          return '편집';
        case 'REVIEW':
          return '검토';
        case 'SUBMIT':
          return '상신';
        case 'APPROVE':
          return '승인';
        case 'REJECT':
          return '반려';
        case 'ATTACHMENT':
          return '첨부';
        case 'AUDIT':
          return '감사';
        case 'LOG':
          return '로그';
        case 'VIEW':
          return '조회';
        default:
          return token;
      }
    })
    .join(' ');
}
