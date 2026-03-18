import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, LoaderCircle, ShieldCheck } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { consentKeys } from '../features/consent/ConsentGate';
import { fetchConsentStatuses, fetchRequiredConsentCheck, submitConsents } from '../features/consent/api';
import type { ConsentStatus } from '../features/consent/types';

export default function RequiredConsentPage() {
  const queryClient = useQueryClient();
  const requiredCheckQuery = useQuery({
    queryKey: consentKeys.required,
    queryFn: fetchRequiredConsentCheck,
  });
  const statusesQuery = useQuery({
    queryKey: consentKeys.statuses,
    queryFn: fetchConsentStatuses,
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
    return (
      <FullscreenShell>
        <GateNotice
          title="동의 정보를 불러오지 못했습니다"
          description="백엔드와 통신할 수 없거나 동의 조회 요청이 실패했습니다. 새로고침 후 다시 시도해 주세요."
          tone="warning"
        />
      </FullscreenShell>
    );
  }

  return (
    <FullscreenShell>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-full bg-primary/12 px-3 py-1 text-primary hover:bg-primary/12">
            Consent Required
          </Badge>
          <Badge variant="outline" className="rounded-full px-3 py-1">
            필수 동의 필요
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[32px] border border-border/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(243,246,252,0.96))] px-8 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">서비스 사용 전 필수 동의를 완료해 주세요</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              필수 약관 동의가 끝나야 프로젝트 허브와 업무 화면 접근이 열립니다. 최초 로그인 사용자는 이 단계를 먼저 통과해야 합니다.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {terms.map((term) => (
                <Card key={term.code} className="rounded-[26px] border-border/70 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {term.isRequired ? (
                            <Badge className="rounded-full bg-rose-500/10 px-3 py-1 text-rose-700 hover:bg-rose-500/10">
                              필수
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-full px-3 py-1">
                              선택
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
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{term.type}</span>
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
          </section>

          <section className="rounded-[32px] border border-border/70 bg-background px-7 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Consent Step</div>
                <div className="text-lg font-semibold text-foreground">서비스 접근 열기</div>
              </div>
            </div>

            {requiredCheckQuery.data?.missingRequiredConsentCodes.length ? (
              <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50/70 px-5 py-4 text-sm leading-6 text-amber-900">
                현재 미충족 필수 동의: {requiredCheckQuery.data.missingRequiredConsentCodes.join(', ')}
              </div>
            ) : null}

            <div className="mt-6 space-y-3 rounded-[24px] border border-border/70 bg-muted/15 px-5 py-5 text-sm leading-6 text-muted-foreground">
              <p>필수 항목을 모두 체크한 뒤 제출하면 프로젝트 허브와 생성 화면 접근이 열립니다.</p>
              <p>선택 항목은 비워둬도 진행할 수 있지만, 필수 항목은 모두 동의해야 합니다.</p>
            </div>

            <Button
              className="mt-8 w-full rounded-2xl"
              disabled={!allRequiredChecked || submitMutation.isPending}
              onClick={() => void submitMutation.mutateAsync(terms)}
            >
              {submitMutation.isPending ? '동의 제출 중...' : '동의 제출 후 계속'}
            </Button>
          </section>
        </div>
      </div>
    </FullscreenShell>
  );
}

function FullscreenShell({ children }: { children: React.ReactNode }) {
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
