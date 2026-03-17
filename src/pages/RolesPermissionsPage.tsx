import UnsupportedBackendPage from '../shared/ui/UnsupportedBackendPage';

export default function RolesPermissionsPage() {
  return (
    <UnsupportedBackendPage
      title="역할 / 권한 화면 미연동"
      description="역할 정의, 권한 바인딩, RBAC 편집은 현재 백엔드에서 대응 API가 없어 메인 워크플로우에서 제거했습니다."
    />
  );
}
