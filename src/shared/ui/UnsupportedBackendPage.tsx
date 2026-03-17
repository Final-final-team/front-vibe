import { Link } from 'react-router-dom';
import { appConfig } from '../config/app-config';

type Props = {
  title: string;
  description: string;
};

export default function UnsupportedBackendPage({ title, description }: Props) {
  return (
    <div className="rounded-3xl border border-border/70 bg-background px-6 py-10">
      <div className="max-w-3xl">
        <div className="text-xs font-semibold tracking-[0.12em] text-primary">BACKEND-FIRST</div>
        <h2 className="mt-3 text-2xl font-semibold text-foreground">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
        <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-muted/10 px-4 py-4 text-sm text-muted-foreground">
          현재 backend `refactor/11`에는 이 화면을 뒷받침하는 REST API가 없습니다. mock 기반 편집 화면 대신 실제 지원 기능만 메인 플로우에 남겨둔 상태입니다.
        </div>
        <div className="mt-6">
          <Link
            to={`/projects/${appConfig.defaultProjectId}/tasks`}
            className="inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            실제 연동된 업무 화면으로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
