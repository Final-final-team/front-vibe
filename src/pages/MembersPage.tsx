import { useMemo, useState } from 'react';
import { MailPlus, ShieldCheck, UserPlus2, Users } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { useProjectMembers, useProjectRoles } from '../features/workspace/hooks';
import { formatDate } from '../shared/lib/format';

type PendingInvite = {
  id: string;
  email: string;
  name: string;
  team: string;
  roleId: string;
};

export default function MembersPage() {
  const { projectId } = useParams();
  const membersQuery = useProjectMembers(projectId ?? null);
  const rolesQuery = useProjectRoles(projectId ?? null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    team: '',
    roleId: '',
  });

  const roles = rolesQuery.data ?? [];
  const members = useMemo(() => {
    const base = membersQuery.data ?? [];
    return [
      ...pendingInvites.map((invite, index) => ({
        id: 9000 + index,
        name: invite.name,
        email: invite.email,
        team: invite.team,
        inviteStatus: 'INVITED' as const,
        roleIds: invite.roleId ? [invite.roleId] : [],
        lastActiveAt: null,
      })),
      ...base,
    ];
  }, [membersQuery.data, pendingInvites]);

  const activeCount = members.filter((member) => member.inviteStatus === 'ACTIVE').length;
  const invitedCount = members.filter((member) => member.inviteStatus === 'INVITED').length;

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-border/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(243,246,252,0.96))] px-6 py-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:px-8 md:py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge className="rounded-full bg-primary/12 px-3 py-1 text-primary hover:bg-primary/12">Admin Console</Badge>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">프로젝트 멤버</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
              현재 사용자는 관리자 기준으로 보고 있습니다. 멤버 상태와 역할 연결을 확인하고, 곧 붙을 초대 API 자리에 맞춰
              초대 버튼을 먼저 노출합니다.
            </p>
          </div>
          <Button className="rounded-2xl" onClick={() => setInviteOpen(true)}>
            <UserPlus2 size={16} />
            멤버 초대
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <SummaryCard title="전체 멤버" value={`${members.length}명`} icon={<Users size={16} />} />
          <SummaryCard title="활성 멤버" value={`${activeCount}명`} icon={<ShieldCheck size={16} />} />
          <SummaryCard title="초대 대기" value={`${invitedCount}명`} icon={<MailPlus size={16} />} />
        </div>
      </section>

      <section className="rounded-[28px] border border-border/70 bg-background shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
        <div className="border-b border-border/70 px-5 py-4">
          <div className="text-sm font-semibold text-foreground">멤버 목록</div>
          <div className="mt-1 text-sm text-muted-foreground">역할, 초대 상태, 최근 활동 시각을 함께 확인합니다.</div>
        </div>
        <div className="divide-y divide-border/60">
          {members.map((member) => (
            <div key={`${member.id}-${member.email}`} className="grid gap-4 px-5 py-4 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:items-center">
              <div>
                <div className="text-sm font-semibold text-foreground">{member.name}</div>
                <div className="mt-1 text-sm text-muted-foreground">{member.email}</div>
              </div>
              <div className="text-sm text-muted-foreground">{member.team}</div>
              <div className="flex flex-wrap gap-2">
                {member.roleIds.map((roleId) => {
                  const role = roles.find((item) => item.id === roleId);
                  return (
                    <span
                      key={roleId}
                      className="rounded-full px-3 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: role?.color ?? '#475569' }}
                    >
                      {role?.name ?? roleId}
                    </span>
                  );
                })}
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <StatusBadge status={member.inviteStatus} />
                <span className="text-muted-foreground">
                  {member.lastActiveAt ? `최근 활동 ${formatDate(member.lastActiveAt)}` : '아직 활동 이력 없음'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-lg rounded-[28px]">
          <DialogHeader>
            <DialogTitle>멤버 초대</DialogTitle>
            <DialogDescription>
              백엔드 초대 API가 추가되면 이 다이얼로그를 실제 요청으로 연결합니다. 지금은 관리자 UX와 입력 구조만 먼저 맞춥니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Field label="이름">
              <Input value={inviteForm.name} onChange={(event) => setInviteForm((prev) => ({ ...prev, name: event.target.value }))} />
            </Field>
            <Field label="이메일">
              <Input type="email" value={inviteForm.email} onChange={(event) => setInviteForm((prev) => ({ ...prev, email: event.target.value }))} />
            </Field>
            <Field label="팀">
              <Input value={inviteForm.team} onChange={(event) => setInviteForm((prev) => ({ ...prev, team: event.target.value }))} />
            </Field>
            <Field label="기본 역할 ID">
              <Input
                placeholder={roles[0]?.id ?? 'role-admin'}
                value={inviteForm.roleId}
                onChange={(event) => setInviteForm((prev) => ({ ...prev, roleId: event.target.value }))}
              />
            </Field>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>닫기</Button>
            <Button
              onClick={() => {
                setPendingInvites((prev) => [
                  {
                    id: crypto.randomUUID(),
                    email: inviteForm.email,
                    name: inviteForm.name || inviteForm.email.split('@')[0],
                    team: inviteForm.team || '초대 대기',
                    roleId: inviteForm.roleId || roles[0]?.id || '',
                  },
                  ...prev,
                ]);
                setInviteForm({ name: '', email: '', team: '', roleId: '' });
                setInviteOpen(false);
              }}
              disabled={!inviteForm.email.trim()}
            >
              초대 추가
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}

function SummaryCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[22px] border border-border/70 bg-background/85 px-4 py-4">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: 'ACTIVE' | 'INVITED' | 'EXPIRED' | 'DECLINED' }) {
  const tone =
    status === 'ACTIVE'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'INVITED'
        ? 'bg-blue-100 text-blue-700'
        : status === 'EXPIRED'
          ? 'bg-amber-100 text-amber-700'
          : 'bg-rose-100 text-rose-700';

  return <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}
