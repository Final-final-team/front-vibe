import { useState } from 'react';
import { LockKeyhole, Shield, UserCog } from 'lucide-react';
import { useProjectMembers, usePermissions, useProjectRoles } from '../features/workspace/hooks';
import { useWorkspace } from '../features/workspace/use-workspace';
import Card from '../shared/ui/Card';
import MetricCard from '../shared/ui/MetricCard';
import StatusPill from '../shared/ui/StatusPill';

export default function RolesPermissionsPage() {
  const { currentProject } = useWorkspace();
  const { data: roles = [] } = useProjectRoles(currentProject?.id ?? null);
  const { data: permissions = [] } = usePermissions();
  const { data: members = [] } = useProjectMembers(currentProject?.id ?? null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0];
  const assignedMembers = members.filter((member) => selectedRole?.memberIds.includes(member.id));
  const categories = [...new Set(permissions.map((permission) => permission.category))];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-3">
        <MetricCard
          label="Role Catalog"
          value={`${roles.length}개`}
          hint="프로젝트별로 독립된 역할 집합"
          icon={<Shield size={18} />}
        />
        <MetricCard
          label="Permission Set"
          value={`${permissions.length}개`}
          hint="AWS IAM처럼 역할이 권한 집합을 보유"
          icon={<LockKeyhole size={18} />}
        />
        <MetricCard
          label="Assigned Members"
          value={`${members.filter((member) => member.roleIds.length > 0).length}명`}
          hint="최소 1개 역할이 연결된 멤버"
          icon={<UserCog size={18} />}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card title="역할 리스트" description="프로젝트 단위 RBAC 카탈로그">
          <div className="space-y-3">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRoleId(role.id)}
                className={[
                  'w-full rounded-2xl border px-4 py-4 text-left transition',
                  selectedRole?.id === role.id
                    ? 'border-blue-300 bg-blue-50 shadow-[0_8px_24px_rgba(37,99,235,0.08)]'
                    : 'border-gray-200 bg-white hover:border-gray-300',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-gray-900">{role.name}</div>
                  <span
                    className="inline-flex rounded-full px-2 py-1 text-xs font-semibold text-white"
                    style={{ backgroundColor: role.color }}
                  >
                    {role.memberIds.length}명
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600">{role.description}</p>
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card
            title={selectedRole?.name ?? '역할 상세'}
            description={selectedRole?.description ?? '역할을 선택하면 상세 권한을 보여줍니다.'}
            action={<StatusPill tone="purple">Project-scoped role</StatusPill>}
          >
            <div className="grid gap-5 lg:grid-cols-2">
              {categories.map((category) => {
                const items = permissions.filter((permission) => permission.category === category);

                return (
                  <div key={category} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
                    <div className="text-sm font-semibold text-gray-900">{category}</div>
                    <div className="mt-3 space-y-3">
                      {items.map((permission) => {
                        const enabled = selectedRole?.permissionKeys.includes(permission.key);
                        return (
                          <div
                            key={permission.key}
                            className={[
                              'rounded-2xl border px-3 py-3 text-sm transition',
                              enabled
                                ? 'border-blue-200 bg-white text-gray-700'
                                : 'border-transparent bg-transparent text-gray-400',
                            ].join(' ')}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium">{permission.name}</span>
                              <StatusPill tone={enabled ? 'blue' : 'slate'}>
                                {enabled ? '허용' : '미할당'}
                              </StatusPill>
                            </div>
                            <p className="mt-2 leading-6">{permission.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card title="멤버 할당" description="현재 선택된 역할에 연결된 프로젝트 멤버">
              <div className="space-y-3">
                {assignedMembers.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
                    아직 이 역할에 연결된 멤버가 없습니다.
                  </div>
                ) : (
                  assignedMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 px-4 py-3"
                    >
                      <div>
                        <div className="font-semibold text-gray-900">{member.name}</div>
                        <div className="mt-1 text-sm text-gray-500">{member.team}</div>
                      </div>
                      <StatusPill tone="teal">{member.inviteStatus === 'ACTIVE' ? '활성' : '대기'}</StatusPill>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card title="정책 미확정" description="이벤트스토밍에서 아직 비어 있는 지점">
              <ul className="space-y-3 text-sm leading-6 text-gray-600">
                <li>역할 삭제/해제 이벤트와 감사 로그 표현은 아직 확정되지 않았습니다.</li>
                <li>전역 역할과 프로젝트 역할 혼합 모델은 범위에서 제외되어 있습니다.</li>
                <li>권한 변경이 기존 승인 효력에 미치는 영향은 review 정책과 맞춰야 합니다.</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
