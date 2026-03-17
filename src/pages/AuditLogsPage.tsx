import UnsupportedBackendPage from '../shared/ui/UnsupportedBackendPage';

export default function AuditLogsPage() {
  return (
    <UnsupportedBackendPage
      title="감사 로그 화면 미연동"
      description="현재 백엔드는 review 이력 API는 제공하지만, 프로젝트 전역 감사 로그 화면을 구성할 별도 조회 API는 아직 없습니다."
    />
  );
}
