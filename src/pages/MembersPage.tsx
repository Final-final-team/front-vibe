import { useMemo, useState } from 'react';
import { MailPlus, ShieldCheck, UserCheck, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();
  const { currentProject } = useWorkspace();
  const { data: members = [] } = useProjectMembers(currentProject?.id ?? null);
  const { data: roles = [] } = useProjectRoles(currentProject?.id ?? null);
  const [draftName, setDraftName] = useState('');
  const [draftEmail, setDraftEmail] = useState('');
  const [draftRoleId, setDraftRoleId] = useState('');
  const [localInvites, setLocalInvites] = useState<typeof members>([]);

  const isInviteOpen = location.hash === '#invite';
  const mergedMembers = useMemo(() => [...localInvites, ...members], [localInvites, members]);

  const invitedCount = mergedMembers.filter((member) => member.inviteStatus === 'INVITED').length;
  const activeCount = mergedMembers.filter((member) => member.inviteStatus === 'ACTIVE').length;
  const pendingCount = mergedMembers.filter((member) => member.inviteStatus !== 'ACTIVE').length;

  function openInvite() {
    navigate('/members#invite');
  }

  function closeInvite() {
    navigate('/members', { replace: true });
  }

  function handleInviteConfirm() {
    if (!draftName.trim() || !draftEmail.trim()) {
      return;
    }

    const roleId = draftRoleId || roles[0]?.id || '';

    setLocalInvites((prev) => [
      {
        id: Date.now(),
        name: draftName.trim(),
        email: draftEmail.trim(),
        team: '초대 예정',
        inviteStatus: 'INVITED',
        roleIds: roleId ? [roleId] : [],
        lastActiveAt: null,
      },
      ...prev,
    ]);
    setDraftName('');
    setDraftEmail('');
    setDraftRoleId('');
    closeInvite();
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

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1.35fr)_320px]">
        <section className="border-t border-border/70 pt-4">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-foreground">프로젝트 멤버</h2>
              <p className="mt-1 text-sm text-muted-foreground">초대 상태와 프로젝트 내 역할 연결을 한 화면에서 확인합니다.</p>
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

        <div className="space-y-6">
          <section className="border-t border-border/70 pt-4">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-foreground">초대 플로우</h2>
                <p className="mt-1 text-sm text-muted-foreground">공개 회원가입 대신 초대 기반 참여 구조를 유지합니다.</p>
              </div>
              <div id="invite">
                <Button variant="secondary" onClick={openInvite}>
                  멤버 초대
                </Button>
              </div>
            </div>
            <div className="space-y-3 text-sm leading-6 text-gray-600">
              <p>1. 운영자가 프로젝트 초대를 발송합니다.</p>
              <p>2. 수신자는 링크를 통해 프로젝트에 합류합니다.</p>
              <p>3. 합류 후 역할 연결이 완료되어야 실제 업무/검토 탭 접근이 열립니다.</p>
            </div>
          </section>

          <section className="border-t border-border/70 pt-4">
            <div className="mb-4">
              <h2 className="text-base font-semibold tracking-tight text-foreground">온보딩 기준</h2>
              <p className="mt-1 text-sm text-muted-foreground">지금 구조에서 가정하고 있는 멤버십 원칙입니다.</p>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-gray-600">
              <li>초대 상태는 `대기/수락/만료/거절` 4단계로만 노출합니다.</li>
              <li>권한은 직접 부여하지 않고 반드시 프로젝트 역할을 통해 연결합니다.</li>
              <li>만료/거절 상태는 후속 조치 대상을 분리해서 보이게 유지합니다.</li>
            </ul>
          </section>
        </div>
      </div>

      <Dialog
        open={isInviteOpen}
        title="멤버 초대"
        description="이 플로우는 추후 실제 초대 API 또는 이메일 발송으로 연결될 수 있도록 Dialog 기반으로 열어 둡니다."
        confirmLabel="초대 추가"
        confirmDisabled={!draftName.trim() || !draftEmail.trim()}
        onCancel={closeInvite}
        onConfirm={handleInviteConfirm}
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">이름</span>
            <input
              type="text"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="초대할 멤버 이름"
              className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-300"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">이메일</span>
            <input
              type="email"
              value={draftEmail}
              onChange={(event) => setDraftEmail(event.target.value)}
              placeholder="name@example.com"
              className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-300"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">초기 역할</span>
            <select
              value={draftRoleId}
              onChange={(event) => setDraftRoleId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-300"
            >
              <option value="">기본 역할 선택</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-500">
            현재는 프론트 mock 상태에만 초대 대기 멤버를 추가합니다. 실제 연동 시에는 초대 발송, 토큰 검증, 수락/만료 처리 API를 별도로 연결해야 합니다.
          </div>
        </div>
      </Dialog>
    </div>
  );
}
