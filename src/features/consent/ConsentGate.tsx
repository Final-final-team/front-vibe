import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, LoaderCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { appConfig } from '../../shared/config/app-config';
import { fetchConsentStatuses, fetchRequiredConsentCheck, submitConsents } from './api';
import type { ConsentStatus } from './types';

type Props = {
  children: ReactNode;
};

const consentKeys = {
  all: ['consents'] as const,
  statuses: ['consents', 'statuses'] as const,
  required: ['consents', 'required-check'] as const,
};

export default function ConsentGate({ children }: Props) {
  const queryClient = useQueryClient();
  const enabled = !appConfig.useMock;

  const requiredCheckQuery = useQuery({
    queryKey: consentKeys.required,
    queryFn: fetchRequiredConsentCheck,
    enabled,
  });

  const statusesQuery = useQuery({
    queryKey: consentKeys.statuses,
    queryFn: fetchConsentStatuses,
    enabled,
  });

  const [agreements, setAgreements] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!statusesQuery.data) {
      return;
    }

    setAgreements(
      statusesQuery.data.reduce<Record<string, boolean>>((acc, term) => {
        acc[term.code] = term.agreed;
        return acc;
      }, {}),
    );
  }, [statusesQuery.data]);

  const submitMutation = useMutation({
    mutationFn: (terms: ConsentStatus[]) =>
      submitConsents({
        agreements: terms.map((term) => ({
          type: term.type,
          code: term.code,
          version: term.version,
          agreed: agreements[term.code] ?? false,
        })),
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: consentKeys.required }),
        queryClient.invalidateQueries({ queryKey: consentKeys.statuses }),
      ]);
    },
  });

  const terms = useMemo(() => statusesQuery.data ?? [], [statusesQuery.data]);
  const requiredTerms = useMemo(() => terms.filter((term) => term.isRequired), [terms]);
  const allRequiredChecked = requiredTerms.every((term) => agreements[term.code]);

  if (appConfig.useMock) {
    return <>{children}</>;
  }

  if (requiredCheckQuery.isLoading || statusesQuery.isLoading) {
    return (
      <FullscreenShell>
        <GateNotice
          title="동의 상태를 확인하는 중입니다"
          description="서비스 접근에 필요한 필수 동의 여부를 확인하고 있습니다."
          tone="loading"
        />
      </FullscreenShell>
    );
  }

  if (requiredCheckQuery.isError || statusesQuery.isError) {
    return <>{children}</>;
  }

  if (requiredCheckQuery.data?.requiredConsentsSatisfied) {
    return <>{children}</>;
  }

  return (
    <FullscreenShell>
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-primary/12 px-3 py-1 text-primary hover:bg-primary/12">
            Consent Gate
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1">
            필수 동의 필요
          </Badge>
        </div>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">서비스 사용 전 필수 동의를 완료해 주세요</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            `feat/user`에서 추가된 동의 도메인 기준으로, 필수 약관에 동의해야 내부 업무 화면에 접근할 수 있습니다.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {terms.map((term) => (
            <Card key={term.code} className="rounded-[26px] border-border/70 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {term.isRequired && (
                        <Badge className="rounded-full bg-rose-500/10 px-3 py-1 text-rose-700 hover:bg-rose-500/10">
                          필수
                        </Badge>
                      )}
                      <Badge variant="outline" className="rounded-full px-3 py-1">
                        v{term.version}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{term.title}</CardTitle>
                    <CardDescription className="leading-6">{term.description}</CardDescription>
                  </div>
                  <label className="inline-flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/20 px-3 py-2 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border accent-primary"
                      checked={agreements[term.code] ?? false}
                      onChange={(event) =>
                        setAgreements((prev) => ({
                          ...prev,
                          [term.code]: event.target.checked,
                        }))
                      }
                    />
                    동의
                  </label>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between pt-0">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {term.type}
                </span>
                {agreements[term.code] ? (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <CheckCircle2 size={16} />
                    동의 예정
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <AlertTriangle size={16} />
                    미동의
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {requiredCheckQuery.data?.missingRequiredConsentCodes.length ? (
          <div className="rounded-[24px] border border-amber-200 bg-amber-50/70 px-5 py-4 text-sm leading-6 text-amber-900">
            현재 미충족 필수 동의: {requiredCheckQuery.data.missingRequiredConsentCodes.join(', ')}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4 rounded-[26px] border border-border/70 bg-card px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          <div className="text-sm leading-6 text-muted-foreground">
            필수 항목을 모두 체크하면 서비스 접근이 열립니다.
          </div>
          <Button
            className="rounded-2xl"
            disabled={!allRequiredChecked || submitMutation.isPending}
            onClick={() => void submitMutation.mutateAsync(terms)}
          >
            {submitMutation.isPending ? '동의 제출 중...' : '동의 제출 후 계속'}
          </Button>
        </div>
      </div>
    </FullscreenShell>
  );
}

function FullscreenShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_20%),linear-gradient(180deg,#f7f9fc_0%,#fbfcfe_100%)] px-6 py-12">
      {children}
    </div>
  );
}

function GateNotice({
  title,
  description,
  tone,
}: {
  title: string;
  description: string;
  tone: 'warning' | 'loading';
}) {
  return (
    <div className="mx-auto max-w-xl rounded-[28px] border border-border/70 bg-card px-8 py-10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        {tone === 'loading' ? <LoaderCircle className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
    </div>
  );
}
