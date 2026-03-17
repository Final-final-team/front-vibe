import { Link } from 'react-router-dom';
import { appConfig } from '../config/app-config';
import PageHero from './PageHero';
import StatusPill from './StatusPill';

type Props = {
  title: string;
  description: string;
};

export default function UnsupportedBackendPage({ title, description }: Props) {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={<StatusPill tone="slate">BACKEND-FIRST</StatusPill>}
        title={title}
        description={description}
        actions={
          <Link
            to={`/projects/${appConfig.defaultProjectId}/tasks`}
            className="inline-flex rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_12px_28px_rgba(37,99,235,0.2)]"
          >
            실제 연동된 업무 화면으로 이동
          </Link>
        }
      />

      <section className="rounded-[28px] border border-dashed border-border/70 bg-background/90 px-6 py-6">
        <div className="max-w-3xl text-sm leading-7 text-muted-foreground">
          현재 backend `refactor/11`에는 이 화면을 뒷받침하는 REST API가 없습니다. mock 기반 편집 화면 대신 실제 지원 기능만 메인 플로우에 남겨둔 상태이며,
          API가 생기면 같은 레이아웃 톤을 유지한 채 실제 데이터 화면으로 바로 대체할 수 있게 구성해두었습니다.
        </div>
      </section>
    </div>
  );
}
