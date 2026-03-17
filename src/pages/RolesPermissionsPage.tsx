import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, LockKeyhole, Shield, UserCog } from 'lucide-react';
import { Button } from '../components/ui/button';
import { usePermissions, useProjectRoles } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import MetricCard from '../shared/ui/MetricCard';
import AppModal from '../shared/ui/AppModal';
import StatusPill from '../shared/ui/StatusPill';

type RolePermissionOverrides = Record<string, string[]>;

export default function RolesPermissionsPage() {
  const { currentProject } = useWorkspace();
  const { data: roles = [] } = useProjectRoles(currentProject?.id ?? null);
  const { data: permissions = [] } = usePermissions();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [detailRoleId, setDetailRoleId] = useState<string | null>(null);
  const [permissionRoleId, setPermissionRoleId] = useState<string | null>(null);
  const [showPolicyStatements, setShowPolicyStatements] = useState(false);
  const [permissionOverrides, setPermissionOverrides] = useState<RolePermissionOverrides>({});
  const [draftPermissionKeys, setDraftPermissionKeys] = useState<string[]>([]);

  const visiblePermissions = useMemo(() => permissions, [permissions]);
  const roleById = useMemo(() => new Map(roles.map((role) => [role.id, role])), [roles]);
  const selectedRole = roleById.get(selectedRoleId ?? '') ?? roles[0] ?? null;
  const detailRole = roleById.get(detailRoleId ?? '') ?? null;
  const permissionRole = roleById.get(permissionRoleId ?? '') ?? null;
  const selectedKeys = selectedRole ? getEffectivePermissionKeys(selectedRole.id, selectedRole.permissionKeys, permissionOverrides) : [];
  const detailKeys = detailRole ? getEffectivePermissionKeys(detailRole.id, detailRole.permissionKeys, permissionOverrides) : [];
  const categories = useMemo(() => [...new Set(visiblePermissions.map((permission) => permission.category))], [visiblePermissions]);
  const groupedCatalog = categories.map((category) => ({
    category,
    items: visiblePermissions.filter((permission) => permission.category === category),
  }));
  const selectedPermissionDefinitions = visiblePermissions.filter((permission) => selectedKeys.includes(permission.key));
  const detailPermissionDefinitions = visiblePermissions.filter((permission) => detailKeys.includes(permission.key));

  function openPermissionModal(roleId: string) {
    const role = roleById.get(roleId);
    if (!role) {
      return;
    }
    setDraftPermissionKeys(getEffectivePermissionKeys(role.id, role.permissionKeys, permissionOverrides));
    setPermissionRoleId(role.id);
  }

  function togglePermission(permissionKey: string) {
    setDraftPermissionKeys((current) => (current.includes(permissionKey) ? current.filter((item) => item !== permissionKey) : [...current, permissionKey]));
  }

  function saveRolePermissions() {
    if (!permissionRole) {
      return;
    }
    setPermissionOverrides((current) => ({
      ...current,
      [permissionRole.id]: draftPermissionKeys,
    }));
    setPermissionRoleId(null);
  }

  return (
    <div className="space-y-7">
      <section className="grid gap-4 xl:grid-cols-3">
        <MetricCard label="역할 카탈로그" value={`${roles.length}개`} hint="프로젝트 운영자가 설계하는 역할 집합" icon={<Shield size={18} />} />
        <MetricCard label="부여 가능한 권한" value={`${visiblePermissions.length}개`} hint="역할에 추가하거나 제거할 수 있는 권한" icon={<LockKeyhole size={18} />} />
        <MetricCard label="권한 카테고리" value={`${categories.length}개`} hint="멤버십, 역할 정책, 일정, 검토 운영" icon={<UserCog size={18} />} />
      </section>

      <section className="border-t border-border/70 pt-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">역할 카탈로그</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                역할 / 권한 화면은 역할 정책을 설계하는 곳입니다. 사람에게 역할을 연결하는 조작은 멤버 화면에서만 진행합니다.
              </p>
            </div>
          </div>

        <div className="grid gap-10 xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="space-y-3 border-t border-border/60 pt-4">
            {roles.map((role) => {
              const active = selectedRole?.id === role.id;
              const effectiveKeys = getEffectivePermissionKeys(role.id, role.permissionKeys, permissionOverrides);
              const categoryCount = categories.filter((category) =>
                visiblePermissions.some((permission) => permission.category === category && effectiveKeys.includes(permission.key)),
              ).length;
              return (
                <div
                  key={role.id}
                  className={[
                    'rounded-[28px] border px-5 py-5 text-left transition',
                    active
                      ? 'border-primary/20 bg-primary/[0.07] shadow-[0_18px_40px_-30px_rgba(15,23,42,0.4)]'
                      : 'border-border/70 bg-background hover:border-primary/15 hover:bg-muted/[0.18]',
                  ].join(' ')}
                >
                  <button type="button" onClick={() => setSelectedRoleId(role.id)} className="w-full text-left">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">ROLE</div>
                        <div className="mt-2 text-lg font-semibold text-foreground">{role.name}</div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{role.description}</p>
                      </div>
                      <StatusPill tone={active ? 'blue' : 'slate'}>{effectiveKeys.length}개 권한</StatusPill>
                    </div>
                  </button>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <RoleCountCard label="권한" value={`${effectiveKeys.length}개`} />
                    <RoleCountCard label="카테고리" value={`${categoryCount}개`} />
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 rounded-lg px-3 text-sm font-medium text-primary"
                      onClick={() => {
                        setDetailRoleId(role.id);
                        setShowPolicyStatements(false);
                      }}
                    >
                      상세 보기
                      <ChevronRight size={14} />
                    </Button>
                    <Button type="button" variant="ghost" className="h-8 rounded-lg px-3 text-sm font-medium text-primary" onClick={() => openPermissionModal(role.id)}>
                      권한 관리
                    </Button>
                  </div>
                </div>
              );
            })}
          </aside>

          <div className="space-y-6">
            {selectedRole ? (
              <>
                <div className="rounded-[30px] border border-border/70 bg-muted/[0.14] px-6 py-6">
                  <div className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">현재 선택된 역할</div>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-2xl font-semibold tracking-tight text-foreground">{selectedRole.name}</h3>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{selectedRole.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill tone="slate">프로젝트 전용</StatusPill>
                      <StatusPill tone="blue">{selectedKeys.length}개 허용 권한</StatusPill>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <RoleCountCard label="허용 권한" value={`${selectedKeys.length}개`} />
                    <RoleCountCard
                      label="카테고리 수"
                      value={`${categories.filter((category) => selectedPermissionDefinitions.some((permission) => permission.category === category)).length}개`}
                    />
                    <RoleCountCard label="적용 범위" value={`project/${currentProject?.code ?? 'default'}/*`} wide />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-border/60 pt-4">
                    <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setDetailRoleId(selectedRole.id)}>
                      상세 보기
                    </Button>
                    <Button type="button" className="rounded-xl px-4" onClick={() => openPermissionModal(selectedRole.id)}>
                      전체 권한 관리
                    </Button>
                  </div>
                </div>

                <div className="space-y-6 border-t border-border/60 pt-8">
                  <div>
                    <div className="mb-4 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">허용 권한 요약</div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {categories.map((category) => {
                        const count = selectedPermissionDefinitions.filter((permission) => permission.category === category).length;
                        if (count === 0) return null;
                        return (
                          <div key={category} className="rounded-[22px] border border-border/70 bg-background px-4 py-4">
                            <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{category}</div>
                            <div className="mt-2 text-xl font-semibold tracking-tight text-foreground">{count}개</div>
                            <div className="mt-1 text-sm text-muted-foreground">현재 역할에 허용됨</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="mb-4 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">현재 허용 권한</div>
                    <div className="space-y-3">
                      {selectedPermissionDefinitions.map((permission) => (
                        <div key={permission.key} className="flex items-start justify-between gap-4 border-b border-border/60 pb-3">
                          <div className="min-w-0">
                            <div className="font-medium text-foreground">{permission.name}</div>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">{permission.description}</p>
                          </div>
                          <StatusPill tone="blue">허용</StatusPill>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      <AppModal
        open={Boolean(detailRole)}
        onOpenChange={(open) => {
          if (!open) {
            setDetailRoleId(null);
            setShowPolicyStatements(false);
          }
        }}
        title={detailRole?.name ?? ''}
        description={detailRole?.description}
        badges={
          detailRole ? (
            <>
              <StatusPill tone="slate">상세 정보</StatusPill>
              <StatusPill tone="blue">{detailKeys.length}개 허용 권한</StatusPill>
            </>
          ) : null
        }
        size="md"
        className="sm:max-w-[700px]"
        footer={
          <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setDetailRoleId(null)}>
            닫기
          </Button>
        }
      >
        {detailRole ? (
          <div className="space-y-6">
            <div className="grid gap-4 border-b border-border/70 pb-5">
              <MetaRow label="리소스 스코프" value={`project/${currentProject?.code ?? 'default'}/*`} />
              <MetaRow label="허용 권한 수" value={`${detailKeys.length}개`} />
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">허용 권한</div>
              <div className="mt-4 space-y-3">
                {detailPermissionDefinitions.map((permission) => (
                  <div key={permission.key} className="border-b border-border/60 pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-foreground">{permission.name}</span>
                      <StatusPill tone="blue">허용</StatusPill>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{permission.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border/70 pt-4">
              <button type="button" className="flex items-center gap-2 text-sm font-medium text-primary" onClick={() => setShowPolicyStatements((current) => !current)}>
                정책 문장 {showPolicyStatements ? '접기' : '보기'}
                {showPolicyStatements ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {showPolicyStatements ? (
                <div className="mt-4 space-y-2">
                  {detailKeys.map((permissionKey) => (
                    <div key={permissionKey} className="flex items-start gap-2 border-b border-border/60 pb-2 text-sm">
                      <StatusPill tone="slate">허용</StatusPill>
                      <code className="min-w-0 break-all rounded-md bg-muted/35 px-2 py-1 text-[12px] text-foreground">{buildPolicyStatement(permissionKey)}</code>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </AppModal>

      <AppModal
        open={Boolean(permissionRole)}
        onOpenChange={(open) => {
          if (!open) {
            setPermissionRoleId(null);
            setDraftPermissionKeys([]);
          }
        }}
        title={permissionRole ? `${permissionRole.name} 권한 보기` : ''}
        description="최종관리자는 현재 역할에 부여할 전체 권한을 허용 또는 미허용으로 조정합니다."
        badges={
          permissionRole ? (
            <>
              <StatusPill tone="purple">최종관리자 전용</StatusPill>
              <StatusPill tone="blue">{draftPermissionKeys.length}개 선택</StatusPill>
            </>
          ) : null
        }
        size="md"
        className="sm:max-w-[760px]"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <div className="text-sm text-muted-foreground">정책 문장은 상세 보기 안에서만 확인합니다.</div>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setPermissionRoleId(null)}>
                닫기
              </Button>
              <Button type="button" className="rounded-xl px-4" onClick={saveRolePermissions}>
                권한 저장
              </Button>
            </div>
          </div>
        }
      >
        {permissionRole ? (
          <div className="space-y-6">
            {groupedCatalog.map(({ category, items }) => (
              <section key={category} className="border-t border-border/60 pt-4 first:border-t-0 first:pt-0">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-foreground">{category}</h3>
                  <StatusPill tone="slate">{items.filter((item) => draftPermissionKeys.includes(item.key)).length}개 허용</StatusPill>
                </div>
                <div className="space-y-2">
                  {items.map((permission) => {
                    const active = draftPermissionKeys.includes(permission.key);
                    return (
                      <button
                        key={permission.key}
                        type="button"
                        onClick={() => togglePermission(permission.key)}
                        className={['flex w-full items-start justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition', active ? 'border-primary/30 bg-primary/5' : 'border-border/70 hover:border-border'].join(' ')}
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-foreground">{permission.name}</div>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{permission.description}</p>
                        </div>
                        <StatusPill tone={active ? 'blue' : 'slate'}>{active ? '허용' : '미허용'}</StatusPill>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </AppModal>

    </div>
  );
}

function getEffectivePermissionKeys(roleId: string, fallbackPermissionKeys: string[], overrides: RolePermissionOverrides) {
  return overrides[roleId] ?? fallbackPermissionKeys;
}

function buildPolicyStatement(permissionKey: string) {
  const [resource, ...actions] = permissionKey.split('_');
  const resourceLabel = resource?.toLowerCase() ?? 'project';
  const actionLabel = actions.join(':').toLowerCase();
  return `${resourceLabel}:${actionLabel || 'read'} on project/*`;
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-2 text-sm text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function RoleCountCard({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={[
        'rounded-[20px] border border-border/70 bg-background px-4 py-3',
        wide ? 'md:col-span-1 lg:col-span-1' : '',
      ].join(' ')}
    >
      <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-2 break-all text-base font-semibold tracking-tight text-foreground">{value}</div>
    </div>
  );
}
