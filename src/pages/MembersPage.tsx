import { useState } from 'react';
import type { ReactNode } from 'react';
import { MailPlus, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { usePermissions, useProjectMembers, useProjectRoles, useApplyProjectMemberRoles, useInviteProjectMember } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import { formatDate } from '../shared/lib/format';
import AppModal from '../shared/ui/AppModal';
import StatusPill from '../shared/ui/StatusPill';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { BackendApiError, toBackendApiError } from '../shared/lib/http';

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

type MemberFilter = 'ALL' | 'ACTIVE' | 'INVITED' | 'PENDING';

export default function MembersPage() {
  const { currentProject } = useWorkspace();
  const { data: members = [] } = useProjectMembers(currentProject?.id ?? null);
  const { data: roles = [] } = useProjectRoles(currentProject?.id ?? null);
  const { data: permissions = [] } = usePermissions();
  const applyRolesMutation = useApplyProjectMemberRoles(currentProject?.id ?? null);
  const inviteMemberMutation = useInviteProjectMember(currentProject?.id ?? null);
  const [invitePlanOpen, setInvitePlanOpen] = useState(false);
  const [profileMemberId, setProfileMemberId] = useState<number | null>(null);
  const [assignmentMemberId, setAssignmentMemberId] = useState<number | null>(null);
  const [draftRoleIds, setDraftRoleIds] = useState<string[]>([]);
  const [memberKeyword, setMemberKeyword] = useState('');
  const [memberFilter, setMemberFilter] = useState<MemberFilter>('ALL');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccessMessage, setInviteSuccessMessage] = useState<string | null>(null);

  const profileMember = members.find((member) => member.id === profileMemberId) ?? null;
  const assignmentMember = members.find((member) => member.id === assignmentMemberId) ?? null;
  const assignableRoles = roles.filter((role) => !role.system);

  const invitedCount = members.filter((member) => member.inviteStatus === 'INVITED').length;
  const activeCount = members.filter((member) => member.inviteStatus === 'ACTIVE').length;
  const pendingCount = members.filter((member) => member.inviteStatus !== 'ACTIVE').length;

  const filteredMembers = members.filter((member) => {
    const keyword = memberKeyword.trim().toLowerCase();

    const matchesKeyword =
      keyword.length === 0 ||
      member.name.toLowerCase().includes(keyword) ||
      member.email.toLowerCase().includes(keyword) ||
      member.team.toLowerCase().includes(keyword);

    if (!matchesKeyword) return false;

    if (memberFilter === 'ACTIVE') return member.inviteStatus === 'ACTIVE';
    if (memberFilter === 'INVITED') return member.inviteStatus === 'INVITED';
    if (memberFilter === 'PENDING') return member.inviteStatus !== 'ACTIVE';

    return true;
  });

  const profileRoles = roles.filter((role) => profileMember?.roleIds.includes(role.id));
  const profilePermissionKeys = [...new Set(profileRoles.flatMap((role) => role.permissionKeys))];
  const profilePermissionGroups = permissions
    .filter((permission) => profilePermissionKeys.includes(permission.key))
    .reduce<Record<string, typeof permissions>>((acc, permission) => {
      acc[permission.category] = [...(acc[permission.category] ?? []), permission];
      return acc;
    }, {});

  const currentAssignableRoleIds =
    assignmentMember?.roleIds.filter((roleId) => assignableRoles.some((role) => role.id === roleId)) ?? [];
  const effectiveRoleIds = draftRoleIds.length > 0 ? draftRoleIds : currentAssignableRoleIds;
  const effectiveRoles = roles.filter((role) => effectiveRoleIds.includes(role.id));
  const applyRoleError = applyRolesMutation.error
    ? (applyRolesMutation.error instanceof BackendApiError
        ? applyRolesMutation.error
        : toBackendApiError(applyRolesMutation.error))
    : null;
  const inviteError = inviteMemberMutation.error
    ? (inviteMemberMutation.error instanceof BackendApiError
        ? inviteMemberMutation.error
        : toBackendApiError(inviteMemberMutation.error))
    : null;

  function toggleRole(roleId: string) {
    setDraftRoleIds((current) => (current[0] === roleId ? [] : [roleId]));
  }

  function getAssignableRoleIds(roleIds: string[]) {
    return roleIds.filter((roleId) => assignableRoles.some((role) => role.id === roleId));
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-border/70 bg-[var(--surface-panel)] px-6 py-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-5">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 md:gap-x-10">
          <InlineStat label="활성 멤버" value={`${activeCount}명`} icon={<Users size={15} />} />
          <InlineStat label="대기 초대" value={`${invitedCount}건`} icon={<MailPlus size={15} />} />
          <InlineStat label="역할 수" value={`${roles.length}개`} icon={<ShieldCheck size={15} />} />
          <InlineStat label="추가 확인" value={`${pendingCount}명`} icon={<UserCheck size={15} />} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl px-4" onClick={() => setInvitePlanOpen(true)}>
            멤버 초대
          </Button>
        </div>
        </div>
      </section>

      <div className="space-y-8">
        <section className="rounded-[30px] border border-border/70 bg-white/75 px-5 py-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
          <div className="mb-5 flex items-end justify-between gap-4 border-b border-border/60 pb-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">프로젝트 멤버</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                멤버에게는 역할만 연결하고, 실제 권한은 역할 정책에 따라 자동 반영됩니다.
              </p>
            </div>
            <div className="text-xs text-muted-foreground">행 클릭으로 프로필, 우측 버튼으로 역할 부여</div>
          </div>

          <div className="mb-4 grid gap-3 border-b border-border/60 pb-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <Input
              value={memberKeyword}
              onChange={(event) => setMemberKeyword(event.target.value)}
              placeholder="멤버명/이메일/팀 검색"
              className="h-10 rounded-xl"
            />
            <div className="flex flex-wrap gap-2">
              {([
                { value: 'ALL', label: '전체' },
                { value: 'ACTIVE', label: '참여중' },
                { value: 'INVITED', label: '초대 대기' },
                { value: 'PENDING', label: '추가 확인' },
              ] as const).map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setMemberFilter(filter.value)}
                  className={[
                    'rounded-xl border px-3 py-2 text-sm font-medium transition',
                    memberFilter === filter.value
                      ? 'border-primary/30 bg-primary/5 text-primary'
                      : 'border-border/70 text-muted-foreground hover:border-border',
                  ].join(' ')}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          {filteredMembers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 px-4 py-10 text-center text-sm text-muted-foreground">
              검색/필터 조건에 맞는 멤버가 없습니다.
            </div>
          ) : null}

          <div className="space-y-3 md:hidden">
            {filteredMembers.map((member) => (
              <div key={member.id} className="border-b border-border/70 pb-4">
                <button type="button" onClick={() => setProfileMemberId(member.id)} className="block w-full text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground">{member.name}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{member.team}</div>
                    </div>
                    <StatusPill tone={inviteToneMap[member.inviteStatus]}>{inviteLabelMap[member.inviteStatus]}</StatusPill>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {member.roleIds.map((roleId) => {
                      const role = roles.find((item) => item.id === roleId);
                      return <RoleToken key={roleId} label={role?.name ?? roleId} />;
                    })}
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    {member.lastActiveAt ? `최근 활동 ${formatDate(member.lastActiveAt)}` : '아직 미참여'}
                  </div>
                </button>
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    className="h-9 rounded-xl px-4"
                    onClick={() => {
                      setAssignmentMemberId(member.id);
                      setDraftRoleIds(getAssignableRoleIds(member.roleIds));
                    }}
                  >
                    역할 부여
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[2fr_0.9fr_1.1fr_1.7fr_1fr_0.9fr] border-b border-border/70 pb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <div>멤버</div>
                <div>상태</div>
                <div>소속 팀</div>
                <div>연결 역할</div>
                <div>최근 활동</div>
                <div className="text-right">관리</div>
              </div>
              <div className="divide-y divide-border/70">
                {filteredMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setProfileMemberId(member.id)}
                    className="grid w-full grid-cols-[2fr_0.9fr_1.1fr_1.7fr_1fr_0.9fr] gap-4 rounded-2xl py-4 text-left text-sm transition hover:bg-[var(--surface-panel)]/70"
                  >
                    <div>
                      <div className="font-semibold text-foreground">{member.name}</div>
                      <div className="mt-1 text-muted-foreground">{member.email}</div>
                      <div className="mt-2 text-xs font-medium text-primary/80">프로필 보기</div>
                    </div>
                    <div className="flex items-center">
                      <StatusPill tone={inviteToneMap[member.inviteStatus]}>{inviteLabelMap[member.inviteStatus]}</StatusPill>
                    </div>
                    <div className="flex items-center text-foreground/80">{member.team}</div>
                    <div className="flex flex-wrap gap-1.5">
                      {member.roleIds.map((roleId) => {
                        const role = roles.find((item) => item.id === roleId);
                        return <RoleToken key={roleId} label={role?.name ?? roleId} />;
                      })}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      {member.lastActiveAt ? formatDate(member.lastActiveAt) : '아직 미참여'}
                    </div>
                    <div className="flex items-center justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 rounded-xl px-3 text-sm font-medium"
                        onClick={(event) => {
                          event.stopPropagation();
                          setAssignmentMemberId(member.id);
                          setDraftRoleIds(getAssignableRoleIds(member.roleIds));
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
        footer={
          <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setProfileMemberId(null)}>
            닫기
          </Button>
        }
      >
        {profileMember ? (
          <div className="space-y-5">
            <div className="grid gap-4 border-b border-border/70 pb-5 lg:grid-cols-[minmax(0,1fr)_180px]">
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
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">현재 연결 역할</div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {profileRoles.map((role) => (
                    <RoleToken key={role.id} label={role.name} />
                  ))}
                </div>
                <div className="mt-4 text-xs text-muted-foreground">허용 권한 {profilePermissionKeys.length}개</div>
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">허용 권한</div>
              <div className="mt-3 space-y-4">
                {Object.entries(profilePermissionGroups).map(([category, categoryPermissions]) => (
                  <div key={category} className="border-t border-border/60 pt-3">
                    <div className="text-sm font-semibold text-foreground">{category}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {categoryPermissions.map((permission) => (
                        <StatusPill key={permission.key} tone="slate">
                          {permission.name}
                        </StatusPill>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </AppModal>

      <AppModal
        open={invitePlanOpen}
        onOpenChange={(open) => {
          setInvitePlanOpen(open);
          if (!open) {
            setInviteEmail('');
            setInviteSuccessMessage(null);
          }
        }}
        title="멤버 초대/추가"
        description="이메일만 입력하면 백엔드가 같은 이메일의 사용자를 찾아 프로젝트 멤버로 추가합니다."
        badges={
          <>
            <StatusPill tone="blue">초대 플로우</StatusPill>
            <StatusPill tone="slate">백엔드 연동</StatusPill>
          </>
        }
        footer={
          <div className="flex w-full items-center justify-end gap-3">
            <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setInvitePlanOpen(false)}>
              닫기
            </Button>
            <Button
              type="button"
              className="rounded-xl px-4"
              disabled={inviteMemberMutation.isPending || !inviteEmail.trim()}
              onClick={() => {
                setInviteSuccessMessage(null);
                inviteMemberMutation.mutate(
                  { targetEmail: inviteEmail.trim() },
                  {
                    onSuccess: () => {
                      setInviteSuccessMessage(`${inviteEmail.trim()} 를 프로젝트 멤버로 추가했습니다.`);
                      setInviteEmail('');
                    },
                  },
                );
              }}
            >
              {inviteMemberMutation.isPending ? '추가 중' : '멤버 추가'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <div className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">초대 대상 이메일</div>
            <Input
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              placeholder="예: someone@company.com"
              type="email"
            />
          </div>
          <div className="rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 text-sm leading-6 text-muted-foreground">
            등록된 사용자 이메일을 입력하면 해당 계정을 찾아 프로젝트에 바로 추가합니다. 아직 가입되지 않은 이메일은 초대할 수 없습니다.
          </div>
          {inviteSuccessMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-700">
              {inviteSuccessMessage}
            </div>
          ) : null}
          {inviteError ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-4 text-sm leading-6 text-destructive">
              멤버 추가에 실패했습니다. {inviteError.message}
            </div>
          ) : null}
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
        size="sm"
        bodyClassName="px-5 py-4"
        footerClassName="px-5 py-3"
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
            <div className="text-sm text-muted-foreground">역할 변경은 저장 즉시 멤버/권한 화면에 다시 반영됩니다.</div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setAssignmentMemberId(null)}>
                닫기
              </Button>
              <Button
                type="button"
                className="rounded-xl px-4"
                disabled={applyRolesMutation.isPending}
                onClick={() => {
                  if (!assignmentMember) return;
                  applyRolesMutation.mutate(
                    {
                      projectMemberId: assignmentMember.id,
                      currentRoleIds: currentAssignableRoleIds,
                      nextRoleIds: draftRoleIds,
                    },
                    {
                      onSuccess: () => {
                        setAssignmentMemberId(null);
                        setDraftRoleIds([]);
                      },
                    },
                  );
                }}
              >
                {applyRolesMutation.isPending ? '적용 중' : '역할 적용'}
              </Button>
            </div>
          </div>
        }
      >
        {assignmentMember ? (
          <div className="space-y-4">
            <div className="grid gap-4 border-b border-border/70 pb-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">멤버 정보</div>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
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
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {assignmentMember.roleIds.map((roleId) => {
                    const role = roles.find((item) => item.id === roleId);
                    return <RoleToken key={roleId} label={role?.name ?? roleId} />;
                  })}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">역할 카탈로그</div>
                <div className="text-xs text-muted-foreground">{draftRoleIds.length > 0 ? '1개 선택' : '선택 없음'}</div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {assignableRoles.map((role) => {
                  const active = effectiveRoleIds.includes(role.id);

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={[
                        'w-full rounded-xl border px-3 py-2 text-left transition',
                        active ? 'border-slate-900 bg-slate-50 shadow-[0_6px_16px_rgba(15,23,42,0.06)]' : 'border-border/70 bg-background hover:border-slate-300 hover:bg-muted/20',
                      ].join(' ')}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={[
                                'mt-0.5 inline-flex h-2 w-2 rounded-full',
                                active ? 'bg-slate-900' : 'bg-muted-foreground/35',
                              ].join(' ')}
                            />
                            <span className="truncate text-sm font-semibold leading-none text-foreground">{role.name}</span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="rounded-md border border-border/70 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                              {role.permissionKeys.length}개 권한
                            </span>
                            {role.description ? (
                              <span className="truncate text-[11px] text-muted-foreground">{role.description}</span>
                            ) : null}
                          </div>
                        </div>
                        <span
                          className={[
                            'shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold',
                            active ? 'bg-slate-900 text-white' : 'bg-muted text-muted-foreground',
                          ].join(' ')}
                        >
                          {active ? '적용' : '선택'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 text-sm leading-6 text-muted-foreground">권한 설계와 변경은 역할 / 권한 화면에서만 진행합니다.</div>
            </div>
            {applyRoleError ? (
              <div className="rounded-[22px] border border-destructive/30 bg-destructive/5 px-4 py-4 text-sm leading-6 text-destructive">
                역할 적용에 실패했습니다. {applyRoleError.message}
              </div>
            ) : null}
          </div>
        ) : null}
      </AppModal>
    </div>
  );
}

function RoleToken({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold leading-none tracking-[0.01em] text-slate-600"
      style={undefined}
    >
      {label}
    </span>
  );
}

function InlineStat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
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
