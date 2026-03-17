import { Shield, Users } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { usePermissions, useProjectMembers, useProjectRoles } from '../features/workspace/hooks';

export default function RolesPermissionsPage() {
  const { projectId } = useParams();
  const rolesQuery = useProjectRoles(projectId ?? null);
  const permissionsQuery = usePermissions();
  const membersQuery = useProjectMembers(projectId ?? null);

  const roles = rolesQuery.data ?? [];
  const permissions = permissionsQuery.data ?? [];
  const members = membersQuery.data ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-border/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(243,246,252,0.96))] px-6 py-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:px-8 md:py-8">
        <Badge className="rounded-full bg-primary/12 px-3 py-1 text-primary hover:bg-primary/12">Admin Console</Badge>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">권한과 역할</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          현재 사용자를 관리자 기준으로 가정하고 역할과 권한 구조를 보여줍니다. 실제 편집 API가 붙기 전까지는 조회 중심으로 유지합니다.
        </p>
      </section>

      <section className="grid gap-5 xl:grid-cols-3 md:grid-cols-2">
        {roles.map((role) => (
          <article key={role.id} className="rounded-[28px] border border-border/70 bg-background px-5 py-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: role.color }}>
                  {role.id}
                </div>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-foreground">{role.name}</h3>
              </div>
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: role.color }} />
            </div>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">{role.description}</p>

            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <Users size={16} />
              {members.filter((member) => role.memberIds.includes(member.id)).length}명 연결
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {role.permissionKeys.map((permissionKey) => {
                const permission = permissions.find((item) => item.key === permissionKey);
                return (
                  <span key={permissionKey} className="rounded-full border border-border/70 bg-muted/20 px-3 py-1 text-xs font-semibold text-foreground">
                    {permission?.name ?? permissionKey}
                  </span>
                );
              })}
            </div>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border border-border/70 bg-background shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
        <div className="border-b border-border/70 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Shield size={16} />
            권한 목록
          </div>
          <div className="mt-1 text-sm text-muted-foreground">역할에 묶일 수 있는 권한 항목을 카테고리별로 정리합니다.</div>
        </div>
        <div className="divide-y divide-border/60">
          {permissions.map((permission) => (
            <div key={permission.key} className="grid gap-3 px-5 py-4 md:grid-cols-[0.9fr_1fr_2fr] md:items-center">
              <div className="text-sm font-semibold text-foreground">{permission.name}</div>
              <div className="text-sm text-muted-foreground">{permission.category}</div>
              <div className="text-sm leading-6 text-muted-foreground">{permission.description}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
