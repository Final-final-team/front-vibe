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
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [showPolicyStatements, setShowPolicyStatements] = useState(false);
  const [permissionOverrides, setPermissionOverrides] = useState<RolePermissionOverrides>({});
  const [draftPermissionKeys, setDraftPermissionKeys] = useState<string[]>([]);

  const visiblePermissions = useMemo(
    () => permissions.filter((permission) => permission.key !== 'AUDIT_LOG_VIEW'),
    [permissions],
  );
  const roleById = useMemo(() => new Map(roles.map((role) => [role.id, role])), [roles]);
  const selectedRole = roleById.get(selectedRoleId ?? '') ?? roles[0] ?? null;
  const detailRole = roleById.get(detailRoleId ?? '') ?? null;
  const permissionRole = roleById.get(permissionRoleId ?? '') ?? null;
  const selectedKeys = selectedRole ? getEffectivePermissionKeys(selectedRole.id, selectedRole.permissionKeys, permissionOverrides) : [];
  const detailKeys = detailRole ? getEffectivePermissionKeys(detailRole.id, detailRole.permissionKeys, permissionOverrides) : [];
  const categories = useMemo(
    () => [...new Set(visiblePermissions.map((permission) => permission.category))],
    [visiblePermissions],
  );
  const selectedPermissionDefinitions = visiblePermissions.filter((permission) => selectedKeys.includes(permission.key));
  const detailPermissionDefinitions = visiblePermissions.filter((permission) => detailKeys.includes(permission.key));
  const groupedCatalog = categories.map((category) => ({
    category,
    items: visiblePermissions.filter((permission) => permission.category === category),
  }));

  function openPermissionModal(roleId: string) {
    const role = roleById.get(roleId);
    if (!role) {
      return;
    }
    const effectiveKeys = getEffectivePermissionKeys(role.id, role.permissionKeys, permissionOverrides);
    setDraftPermissionKeys(effectiveKeys);
    setPermissionRoleId(role.id);
  }

  function togglePermission(permissionKey: string) {
    setDraftPermissionKeys((current) =>
      current.includes(permissionKey)
        ? current.filter((item) => item !== permissionKey)
        : [...current, permissionKey],
    );
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
        <MetricCard
          label="역할 카탈로그"
          value={`${roles.length}개`}
          hint="프로젝트 운영자가 설계하는 역할 집합"
          icon={<Shield size={18} />}
        />
        <MetricCard
          label="부여 가능한 권한"
          value={`${visiblePermissions.length}개`}
          hint="역할에 추가하거나 제거할 수 있는 권한"
          icon={<LockKeyhole size={18} />}
        />
        <MetricCard
          label="권한 카테고리"
          value={`${categories.length}개`}
          hint="멤버십, 역할 정책, 일정, 검토 운영"
          icon={<UserCog size={18} />}
        />
      </section>

      <section className="border-t border-border/70 pt-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">역할 카탈로그</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              역할 / 권한 화면은 역할 정책을 설계하는 곳입니다. 사람에게 역할을 연결하는 조작은 멤버 화면에서만 진행합니다.
            </p>
          </div>
          <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setCatalogOpen(true)}>
            전체 권한 보기
          </Button>
        </div>

        <div className="grid gap-10 xl:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-2 border-t border-border/60 pt-2">
            {roles.map((role) => {
              const active = selectedRole?.id === role.id;
              const effectiveKeys = getEffectivePermissionKeys(role.id, role.permissionKeys, permissionOverrides);
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRoleId(role.id)}
                  className={[
                    'w-full border-b border-border/60 px-0 py-4 text-left transition',
                    active ? 'bg-primary/5' : 'hover:bg-muted/10',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-foreground">{role.name}</div>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{role.description}</p>
                    </div>
                    <StatusPill tone="slate">{effectiveKeys.length}개 권한</StatusPill>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 rounded-lg px-3 text-sm font-medium text-primary"
                      onClick={(event) => {
                        event.stopPropagation();
                        setDetailRoleId(role.id);
                        setShowPolicyStatements(false);
                      }}
                    >
                      상세 보기
                      <ChevronRight size={14} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 rounded-lg px-3 text-sm font-medium text-primary"
                      onClick={(event) => {
                        event.stopPropagation();
                        openPermissionModal(role.id);
                      }}
                    >
                      권한 보기
                    </Button>
                  </div>
                </button>
              );
            })}
          </aside>

          <div className="space-y-6">
            {selectedRole ? (
              <>
                <div className="border-t border-border/70 pt-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-foreground">{selectedRole.name}</h3>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{selectedRole.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill tone="slate">프로젝트 전용</StatusPill>
                      <StatusPill tone="blue">{selectedKeys.length}개 허용 권한</StatusPill>
                    </div>
                  </div>
                </div>

                <div className="grid gap-8 border-t border-border/60 pt-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div>
                    <div className="mb-3 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">허용 권한 요약</div>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => {
                        const count = selectedPermissionDefinitions.filter((permission) => permission.category === category).length;
                        if (count === 0) {
                          return null;
                        }
                        return (
                          <StatusPill key={category} tone="slate">
                            {category} {count}개
                          </StatusPill>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="border-b border-border/60 pb-3 text-sm">
                      <div className="text-muted-foreground">적용 범위</div>
                      <div className="mt-1 font-medium text-foreground">project/{currentProject?.code ?? 'default'}/*</div>
                    </div>
                    <div className="border-b border-border/60 pb-3 text-sm">
                      <div className="text-muted-foreground">권한 관리 주체</div>
                      <div className="mt-1 font-medium text-foreground">최종관리자만 수정 가능</div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setDetailRoleId(selectedRole.id)}>
                        상세 보기
                      </Button>
                      <Button type="button" className="rounded-xl px-4" onClick={() => openPermissionModal(selectedRole.id)}>
                        권한 보기
                      </Button>
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
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl px-3"
              onClick={() => setShowPolicyStatements((current) => !current)}
            >
              정책 문장 {showPolicyStatements ? '접기' : '보기'}
              {showPolicyStatements ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </Button>
            <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setDetailRoleId(null)}>
              닫기
            </Button>
          </div>
        }
      >
        {detailRole ? (
          <div className="space-y-5">
            <div className="grid gap-4 border-b border-border/70 pb-4 lg:grid-cols-2">
              <MetaRow label="리소스 스코프" value={`project/${currentProject?.code ?? 'default'}/*`} />
              <MetaRow label="허용 권한 수" value={`${detailKeys.length}개`} />
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">허용 권한</div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
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
            {showPolicyStatements ? (
              <div className="border-t border-border/70 pt-4">
                <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">정책 문장</div>
                <div className="mt-3 space-y-2">
                  {detailKeys.map((permissionKey) => (
                    <div key={permissionKey} className="flex items-center gap-2 border-b border-border/60 pb-2 text-sm">
                      <StatusPill tone="slate">허용</StatusPill>
                      <code className="min-w-0 break-all rounded-md bg-muted/35 px-2 py-1 text-[12px] text-foreground">
                        {buildPolicyStatement(permissionKey)}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
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
        description="최종관리자는 현재 역할에 허용할 권한을 추가하거나 제거할 수 있습니다."
        badges={
          permissionRole ? (
            <>
              <StatusPill tone="purple">최종관리자 전용</StatusPill>
              <StatusPill tone="blue">{draftPermissionKeys.length}개 선택</StatusPill>
            </>
          ) : null
        }
        size="lg"
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
                  <StatusPill tone="slate">
                    {items.filter((item) => draftPermissionKeys.includes(item.key)).length}개 허용
                  </StatusPill>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {items.map((permission) => {
                    const active = draftPermissionKeys.includes(permission.key);
                    return (
                      <button
                        key={permission.key}
                        type="button"
                        onClick={() => togglePermission(permission.key)}
                        className={[
                          'rounded-2xl border px-4 py-4 text-left transition',
                          active ? 'border-primary/30 bg-primary/5' : 'border-border/70 hover:border-border',
                        ].join(' ')}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-foreground">{permission.name}</span>
                          <StatusPill tone={active ? 'blue' : 'slate'}>{active ? '허용' : '미허용'}</StatusPill>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{permission.description}</p>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </AppModal>

      <AppModal
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        title="전체 권한 보기"
        description="현재 시스템에 정의된 권한 카탈로그를 카테고리별로 확인합니다."
        size="lg"
        footer={
          <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setCatalogOpen(false)}>
            닫기
          </Button>
        }
      >
        <div className="space-y-6">
          {groupedCatalog.map(({ category, items }) => (
            <section key={category} className="border-t border-border/60 pt-4 first:border-t-0 first:pt-0">
              <h3 className="text-base font-semibold text-foreground">{category}</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {items.map((permission) => (
                  <div key={permission.key} className="border-b border-border/60 pb-3">
                    <div className="font-medium text-foreground">{permission.name}</div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{permission.description}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </AppModal>
    </div>
  );
}

function getEffectivePermissionKeys(
  roleId: string,
  fallbackPermissionKeys: string[],
  overrides: RolePermissionOverrides,
) {
  return (overrides[roleId] ?? fallbackPermissionKeys).filter((permissionKey) => permissionKey !== 'AUDIT_LOG_VIEW');
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
