import { useMemo, useState } from 'react';
import { LockKeyhole, Shield, UserCog } from 'lucide-react';
import { useProjectMembers, usePermissions, useProjectRoles } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import MetricCard from '../shared/ui/MetricCard';
import StatusPill from '../shared/ui/StatusPill';
import AppModal from '../shared/ui/AppModal';
import { Button } from '../components/ui/button';

export default function RolesPermissionsPage() {
  const { currentProject } = useWorkspace();
  const { data: roles = [] } = useProjectRoles(currentProject?.id ?? null);
  const { data: permissions = [] } = usePermissions();
  const { data: members = [] } = useProjectMembers(currentProject?.id ?? null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [detailRoleId, setDetailRoleId] = useState<string | null>(null);
  const visiblePermissions = useMemo(() => permissions.filter((permission) => permission.key !== 'AUDIT_LOG_VIEW'), [permissions]);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0];
  const detailRole = roles.find((role) => role.id === detailRoleId) ?? null;
  const categories = useMemo(
    () => [...new Set(visiblePermissions.map((permission) => permission.category))],
    [visiblePermissions],
  );
  const policyStatements = (selectedRole?.permissionKeys ?? [])
    .filter((permissionKey) => permissionKey !== 'AUDIT_LOG_VIEW')
    .map((permissionKey) => buildPolicyStatement(permissionKey));
  const selectedRoleCategories = categories
    .map((category) => ({
      category,
      count: visiblePermissions.filter(
        (permission) => permission.category === category && selectedRole?.permissionKeys.includes(permission.key),
      ).length,
    }))
    .filter((item) => item.count > 0);
  const detailCategories = useMemo(
    () =>
      categories.map((category) => ({
        category,
        items: visiblePermissions.filter((permission) => permission.category === category),
      })),
    [categories, visiblePermissions],
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-3">
        <MetricCard
          label="역할 카탈로그"
          value={`${roles.length}개`}
          hint="프로젝트별로 독립된 역할 집합"
          icon={<Shield size={18} />}
        />
        <MetricCard
          label="권한 집합"
          value={`${permissions.length}개`}
          hint="AWS IAM처럼 역할이 권한 집합을 보유"
          icon={<LockKeyhole size={18} />}
        />
        <MetricCard
          label="할당 멤버"
          value={`${members.filter((member) => member.roleIds.length > 0).length}명`}
          hint="최소 1개 역할이 연결된 멤버"
          icon={<UserCog size={18} />}
        />
      </section>

      <div className="grid gap-10 xl:grid-cols-[300px_minmax(0,1fr)]">
        <section className="border-t border-border/70 pt-4">
          <div className="mb-4">
            <h2 className="text-base font-semibold tracking-tight text-foreground">역할 리스트</h2>
            <p className="mt-1 text-sm text-muted-foreground">프로젝트 단위 RBAC 카탈로그</p>
          </div>
          <div className="space-y-3">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => {
                  setSelectedRoleId(role.id);
                  setDetailRoleId(role.id);
                }}
                className={[
                  'w-full border-b border-border/70 px-0 py-4 text-left transition',
                  selectedRole?.id === role.id
                    ? 'border-primary/40 bg-primary/5'
                    : 'hover:border-border',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-gray-900">{role.name}</div>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex rounded-full px-2 py-1 text-xs font-semibold text-white"
                      style={{ backgroundColor: role.color }}
                    >
                      {role.memberIds.length}명
                    </span>
                    <span className="text-xs font-semibold text-primary">상세 보기</span>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600">{role.description}</p>
              </button>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="border-t border-border/70 pt-4">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold tracking-tight text-foreground">{selectedRole?.name ?? '역할 상세'}</h2>
                <p className="mt-1 text-sm text-muted-foreground">권한 설계는 여기서 관리하고, 멤버 화면에서는 이 역할을 사람에게만 연결합니다.</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill tone="purple">프로젝트 전용 역할</StatusPill>
                <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => selectedRole && setDetailRoleId(selectedRole.id)}>
                  권한 세트 열기
                </Button>
              </div>
            </div>
            <div className="mb-6 grid gap-5 border-b border-border/70 pb-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">정책 문장</div>
                <div className="mt-3 space-y-2">
                  {policyStatements.map((statement) => (
                    <div key={statement} className="flex items-center gap-2 border-b border-border/50 pb-2 text-sm last:border-b-0">
                      <StatusPill tone="slate">ALLOW</StatusPill>
                      <code className="rounded-md bg-muted/35 px-2 py-1 text-[12px] text-foreground">{statement}</code>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">적용 범위</div>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span>역할 멤버 수</span>
                    <span className="font-medium text-foreground">{selectedRole?.memberIds.length ?? 0}명</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span>연결 권한 수</span>
                    <span className="font-medium text-foreground">{selectedRole?.permissionKeys.length ?? 0}개</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span>리소스 스코프</span>
                    <span className="font-medium text-foreground">project/{currentProject?.code ?? 'default'}/*</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-5 border-b border-border/70 pb-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">권한 카테고리 요약</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedRoleCategories.map(({ category, count }) => (
                    <StatusPill key={category} tone="slate">
                      {category} {count}개
                    </StatusPill>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">운영 원칙</div>
                <div className="mt-3 rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm leading-6 text-muted-foreground">
                  역할은 권한의 묶음입니다. 프로젝트 운영자는 <span className="font-semibold text-foreground">역할 / 권한</span> 화면에서 정책을 설계하고, <span className="font-semibold text-foreground">멤버</span> 화면에서는 사람에게 역할만 연결합니다.
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-border/70 pt-4">
            <div className="mb-4">
              <h2 className="text-base font-semibold tracking-tight text-foreground">권한 설계 원칙</h2>
              <p className="mt-1 text-sm text-muted-foreground">멤버에게 역할을 연결하는 조작은 멤버 화면에서 진행하고, 이 화면은 역할 정책과 권한 집합의 설계만 담당합니다.</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="border-b border-border/70 pb-4">
                <div className="text-sm font-semibold text-foreground">역할은 정책 묶음</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">직접 권한을 사람에게 주지 않고, 역할에 권한을 모아 반복 가능한 정책 단위로 관리합니다.</p>
              </div>
              <div className="border-b border-border/70 pb-4">
                <div className="text-sm font-semibold text-foreground">멤버 할당은 별도 흐름</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">운영자는 멤버 화면에서 사람을 고르고 역할만 부여합니다. 권한 변경은 이 화면에서만 처리합니다.</p>
              </div>
              <div className="border-b border-border/70 pb-4">
                <div className="text-sm font-semibold text-foreground">로그는 별도 페이지</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">감사 로그와 변경 이력 탐색은 별도 로그 페이지에서 다루고, 역할 상세에서는 정책 자체만 보여줍니다.</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <AppModal
        open={Boolean(detailRole)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailRoleId(null);
          }
        }}
        title={detailRole?.name ?? ''}
        description={detailRole?.description}
        className="w-[min(920px,calc(100vw-2.5rem))] max-w-[calc(100vw-2.5rem)] sm:max-w-[920px]"
        bodyClassName="gap-6 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_240px]"
        footerClassName="px-5 py-3"
        badges={
          detailRole ? (
            <>
              <StatusPill tone="purple">역할 정책</StatusPill>
              <StatusPill tone="blue">{detailRole.permissionKeys.length}개 권한</StatusPill>
            </>
          ) : null
        }
        side={
          detailRole ? (
            <div className="space-y-4">
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">적용 범위</div>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span>리소스 스코프</span>
                    <span className="font-medium text-foreground">project/{currentProject?.code ?? 'default'}/*</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-2">
                    <span>권한 카테고리</span>
                    <span className="font-medium text-foreground">{selectedRoleCategories.length}개</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">운영 메모</div>
                <div className="mt-3 rounded-2xl border border-border/70 bg-muted/15 px-4 py-4 text-sm leading-6 text-muted-foreground">
                  멤버 할당은 멤버 화면에서 처리합니다. 이 모달에서는 역할이 가진 정책과 허용 범위만 검토합니다.
                </div>
              </div>
            </div>
          ) : null
        }
        sideClassName="lg:max-w-[240px]"
        footer={
          <Button type="button" variant="outline" className="min-w-24 rounded-xl px-4" onClick={() => setDetailRoleId(null)}>
            닫기
          </Button>
        }
      >
        {detailRole ? (
          <div className="space-y-5">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">정책 문장</div>
              <div className="mt-3 space-y-2">
                {detailRole.permissionKeys.map((permissionKey) => (
                  <div key={permissionKey} className="flex items-center gap-2 border-b border-border/50 pb-2 text-sm last:border-b-0">
                    <StatusPill tone="slate">ALLOW</StatusPill>
                    <code className="rounded-md bg-muted/35 px-2 py-1 text-[12px] text-foreground">{buildPolicyStatement(permissionKey)}</code>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {detailCategories.map(({ category, items }) => (
                <div key={category} className="border-t border-border/60 pt-4">
                  <div className="text-sm font-semibold text-foreground">{category}</div>
                  <div className="mt-3 space-y-3">
                    {items.map((permission) => {
                      const enabled = detailRole.permissionKeys.includes(permission.key);
                      return (
                        <div
                          key={permission.key}
                          className={[
                            'border-b border-border/60 px-0 py-3 text-sm transition',
                            enabled ? 'text-foreground' : 'text-muted-foreground/55',
                          ].join(' ')}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-medium">{permission.name}</span>
                            <StatusPill tone={enabled ? 'blue' : 'slate'}>{enabled ? '허용' : '미할당'}</StatusPill>
                          </div>
                          <p className="mt-2 leading-6">{permission.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </AppModal>
    </div>
  );
}

function buildPolicyStatement(permissionKey: string) {
  const [resource, ...actions] = permissionKey.split('_');
  const resourceLabel = resource?.toLowerCase() ?? 'project';
  const actionLabel = actions.join(':').toLowerCase();
  return `${resourceLabel}:${actionLabel || 'read'} on project/*`;
}
