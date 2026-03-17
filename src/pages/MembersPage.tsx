import UnsupportedBackendPage from '../shared/ui/UnsupportedBackendPage';

export default function MembersPage() {
  return (
    <UnsupportedBackendPage
      title="멤버 화면 미연동"
      description="프로젝트 멤버 목록, 초대 상태, 역할 연결 UI는 현재 백엔드에서 대응 API가 없어 탐색 전용에서 제외했습니다."
    />
  );
}
