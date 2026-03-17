import UnsupportedBackendPage from '../shared/ui/UnsupportedBackendPage';

export default function MilestonesPage() {
  return (
    <UnsupportedBackendPage
      title="마일스톤 화면 미연동"
      description="마일스톤 구조와 진행률 집계는 현재 백엔드에서 대응 API가 없어 실제 연동 화면으로 제공하지 않습니다."
    />
  );
}
