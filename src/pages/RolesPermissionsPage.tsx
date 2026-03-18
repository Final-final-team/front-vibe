import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useCreateProjectRole, usePermissions, useProjectRoles, useUpdateProjectRolePermissions } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import AppModal from '../shared/ui/AppModal';
import StatusPill from '../shared/ui/StatusPill';
import { BackendApiError, toBackendApiError } from '../shared/lib/http';

type RolePermissionOverrides = Record<string, string[]>;
type RoleDraft = {
  name: string;
  description: string;
  color: string;
};

const ROLE_COLOR_PALETTE = ['#2563eb', '#7c3aed', '#0f766e', '#d97706', '#db2777'];

export default function RolesPermissionsPage() {
  const { currentProject } = useWorkspace();
  const { data: remoteRoles = [] } = useProjectRoles(currentProject?.id ?? null);
  const { data: permissions = [] } = usePermissions();
  const createRoleMutation = useCreateProjectRole(currentProject?.id ?? null);
  const updatePermissionsMutation = useUpdateProjectRolePermissions(currentProject?.id ?? null);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [detailRoleId, setDetailRoleId] = useState<string | null>(null);
  const [permissionRoleId, setPermissionRoleId] = useState<string | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [showPolicyStatements, setShowPolicyStatements] = useState(false);
  const [permissionOverrides, setPermissionOverrides] = useState<RolePermissionOverrides>({});
  const [draftPermissionKeys, setDraftPermissionKeys] = useState<string[]>([]);
  const [roleDraft, setRoleDraft] = useState<RoleDraft>({
    name: '',
    description: '',
    color: ROLE_COLOR_PALETTE[0],
  });

  const roles = useMemo(() => remoteRoles, [remoteRoles]);
  const roleById = useMemo(() => new Map(roles.map((role) => [role.id, role])), [roles]);
  const categories = useMemo(() => [...new Set(permissions.map((permission) => permission.category))], [permissions]);
  const detailRole = roleById.get(detailRoleId ?? '') ?? null;
  const permissionRole = roleById.get(permissionRoleId ?? '') ?? null;
  const detailKeys = detailRole ? getEffectivePermissionKeys(detailRole.id, detailRole.permissionKeys, permissionOverrides) : [];
  const detailPermissionDefinitions = permissions.filter((permission) => detailKeys.includes(permission.key));
  const createRoleError = createRoleMutation.error
    ? (createRoleMutation.error instanceof BackendApiError ? createRoleMutation.error : toBackendApiError(createRoleMutation.error))
    : null;
  const updatePermissionsError = updatePermissionsMutation.error
    ? (updatePermissionsMutation.error instanceof BackendApiError
        ? updatePermissionsMutation.error
        : toBackendApiError(updatePermissionsMutation.error))
    : null;

  function openPermissionModal(roleId: string) {
    const role = roleById.get(roleId);
    if (!role) return;
    setDraftPermissionKeys(getEffectivePermissionKeys(role.id, role.permissionKeys, permissionOverrides));
    setPermissionRoleId(role.id);
  }

  function togglePermission(permissionKey: string) {
    setDraftPermissionKeys((current) =>
      current.includes(permissionKey) ? current.filter((item) => item !== permissionKey) : [...current, permissionKey],
    );
  }

  function saveRolePermissions() {
    if (!permissionRole) return;
    updatePermissionsMutation.mutate(
      { roleId: permissionRole.id, permissionKeys: draftPermissionKeys },
      {
        onSuccess: () => {
          setPermissionOverrides((current) => ({
            ...current,
            [permissionRole.id]: draftPermissionKeys,
          }));
          setPermissionRoleId(null);
        },
      },
    );
  }

  function createRole() {
    const trimmedName = roleDraft.name.trim();
    const trimmedDescription = roleDraft.description.trim();
    if (!trimmedName || !trimmedDescription) return;
    createRoleMutation.mutate(
      {
        name: trimmedName,
        description: trimmedDescription,
      },
      {
        onSuccess: () => {
          setCreateRoleOpen(false);
          setRoleDraft({
            name: '',
            description: '',
            color: ROLE_COLOR_PALETTE[0],
          });
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <section className="pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">역할 카탈로그</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              이 화면은 역할 이름과 책임만 빠르게 보고, 상세 정책과 권한 편집은 모두 모달에서 처리합니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setCatalogOpen(true)}>
              전체 권한 보기
            </Button>
            <Button type="button" className="rounded-xl px-4" onClick={() => setCreateRoleOpen(true)}>
              <Plus size={15} />
              새 역할 추가
            </Button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-6 text-sm">
          <InlineKpi label="역할" value={`${roles.length}개`} />
          <InlineKpi label="권한 카테고리" value={`${categories.length}개`} />
          <InlineKpi label="프로젝트 범위" value={currentProject?.code ?? '-'} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {roles.map((role) => {
          const effectiveKeys = getEffectivePermissionKeys(role.id, role.permissionKeys, permissionOverrides);
          return (
            <article key={role.id} className="border-b border-border/70 px-1 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: role.color }} />
                    <h3 className="text-lg font-semibold text-foreground">{role.name}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{role.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <StatusPill tone="slate">{effectiveKeys.length}개 허용 권한</StatusPill>
                    <StatusPill tone="slate">{currentProject?.code ?? '-'} 범위</StatusPill>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
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
            </article>
          );
        })}
      </section>

      <AppModal
        open={createRoleOpen}
        onOpenChange={setCreateRoleOpen}
        title="새 역할 추가"
        description="역할 이름과 책임만 먼저 만들고 세부 권한은 이후 권한 관리에서 연결합니다."
        badges={
          <>
            <StatusPill tone="purple">역할 생성</StatusPill>
            <StatusPill tone="slate">초기 권한 0개</StatusPill>
          </>
        }
        size="sm"
        className="sm:max-w-[620px]"
        footer={
          <div className="flex w-full items-center justify-end gap-3">
            <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setCreateRoleOpen(false)}>
              취소
            </Button>
            <Button type="button" className="rounded-xl px-4" onClick={createRole} disabled={createRoleMutation.isPending}>
              {createRoleMutation.isPending ? '생성 중' : '역할 생성'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <FormRow label="역할 이름">
            <Input
              value={roleDraft.name}
              onChange={(event) => setRoleDraft((current) => ({ ...current, name: event.target.value }))}
              placeholder="예: 운영 검토 관리자"
            />
          </FormRow>
          <FormRow label="설명">
            <Input
              value={roleDraft.description}
              onChange={(event) => setRoleDraft((current) => ({ ...current, description: event.target.value }))}
              placeholder="이 역할이 담당하는 운영 책임을 짧게 설명합니다."
            />
          </FormRow>
          <FormRow label="식별 색상">
            <div className="flex flex-wrap gap-2">
              {ROLE_COLOR_PALETTE.map((color) => {
                const active = roleDraft.color === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setRoleDraft((current) => ({ ...current, color }))}
                    className={[
                      'h-9 w-9 rounded-full border-2 transition',
                      active ? 'border-foreground shadow-sm' : 'border-transparent hover:border-border',
                    ].join(' ')}
                    style={{ backgroundColor: color }}
                    aria-label={color}
                  />
                );
              })}
            </div>
          </FormRow>
          {createRoleError ? (
            <div className="rounded-[22px] border border-destructive/30 bg-destructive/5 px-4 py-4 text-sm leading-6 text-destructive">
              역할 생성에 실패했습니다. {createRoleError.message}
            </div>
          ) : null}
        </div>
      </AppModal>

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
        className="sm:max-w-[620px]"
        footer={
          <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setDetailRoleId(null)}>
            닫기
          </Button>
        }
      >
        {detailRole ? (
          <div className="space-y-6">
            <div className="grid gap-3 border-b border-border/70 pb-4">
              <MetaRow label="적용 범위" value={`project/${currentProject?.code ?? 'default'}/*`} />
              <MetaRow label="허용 권한 수" value={`${detailKeys.length}개`} />
            </div>
            <div>
              <div className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">허용 권한</div>
              <div className="mt-3 space-y-2.5">
                {detailPermissionDefinitions.map((permission) => (
                  <div key={permission.key} className="border-b border-border/60 pb-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-foreground">{permission.name}</span>
                      <StatusPill tone="blue">허용</StatusPill>
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{permission.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-border/70 pt-4">
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-primary"
                onClick={() => setShowPolicyStatements((current) => !current)}
              >
                정책 문장 {showPolicyStatements ? '접기' : '보기'}
                {showPolicyStatements ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              {showPolicyStatements ? (
                <div className="mt-4 space-y-2">
                  {detailKeys.map((permissionKey) => (
                    <div key={permissionKey} className="flex items-start gap-2 border-b border-border/60 pb-2 text-sm">
                      <StatusPill tone="slate">허용</StatusPill>
                      <code className="min-w-0 break-all rounded-md bg-muted/35 px-2 py-1 text-[12px] text-foreground">
                        {buildPolicyStatement(permissionKey)}
                      </code>
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
        title={permissionRole ? `${permissionRole.name} 권한 관리` : ''}
        description="현재 역할에 부여할 권한을 최종관리자 시점에서 허용 또는 미허용으로 조정합니다."
        badges={
          permissionRole ? (
            <>
              <StatusPill tone="purple">최종관리자 전용</StatusPill>
              <StatusPill tone="blue">{draftPermissionKeys.length}개 허용</StatusPill>
            </>
          ) : null
        }
        size="md"
        className="sm:max-w-[780px]"
        footer={
          <div className="flex w-full items-center justify-end gap-3">
            <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setPermissionRoleId(null)}>
              닫기
            </Button>
            <Button type="button" className="rounded-xl px-4" onClick={saveRolePermissions} disabled={updatePermissionsMutation.isPending}>
              {updatePermissionsMutation.isPending ? '저장 중' : '권한 저장'}
            </Button>
          </div>
        }
      >
        {permissionRole ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button type="button" variant="outline" className="rounded-lg px-3" onClick={() => setDraftPermissionKeys(permissions.map((permission) => permission.key))}>
                전체 허용
              </Button>
              <Button type="button" variant="outline" className="rounded-lg px-3" onClick={() => setDraftPermissionKeys([])}>
                전체 해제
              </Button>
            </div>
            {categories.map((category) => {
              const items = permissions.filter((permission) => permission.category === category);
              return (
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
                          className={[
                            'flex w-full items-start justify-between gap-4 rounded-xl border px-4 py-4 text-left transition',
                            active ? 'border-primary/30 bg-primary/5' : 'border-border/70 hover:border-border',
                          ].join(' ')}
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
              );
            })}
            {updatePermissionsError ? (
              <div className="rounded-[22px] border border-destructive/30 bg-destructive/5 px-4 py-4 text-sm leading-6 text-destructive">
                권한 저장에 실패했습니다. {updatePermissionsError.message}
              </div>
            ) : null}
          </div>
        ) : null}
      </AppModal>

      <AppModal
        open={catalogOpen}
        onOpenChange={setCatalogOpen}
        title="전체 권한 보기"
        description="현재 프로젝트에서 사용할 수 있는 전체 권한 카탈로그를 한 줄씩 확인합니다."
        badges={
          <>
            <StatusPill tone="slate">{permissions.length}개 권한</StatusPill>
            <StatusPill tone="purple">권한 카탈로그</StatusPill>
          </>
        }
        size="md"
        className="sm:max-w-[760px]"
        footer={
          <Button type="button" variant="outline" className="rounded-xl px-4" onClick={() => setCatalogOpen(false)}>
            닫기
          </Button>
        }
      >
        <div className="max-h-[58vh] space-y-3 overflow-y-auto pr-1">
          {permissions.map((permission) => (
            <div key={permission.key} className="border-b border-border/60 pb-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-foreground">{permission.name}</div>
                <StatusPill tone="slate">{permission.category}</StatusPill>
              </div>
              <div className="mt-2 text-sm leading-6 text-muted-foreground">{permission.description}</div>
            </div>
          ))}
        </div>
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

function InlineKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm text-muted-foreground">
      <span>{label}</span>
      <span className="ml-2 font-semibold text-foreground">{value}</span>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-2 text-sm text-muted-foreground">
      <span>{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}
