import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import AppModal from '../../shared/ui/AppModal';
import { fetchConsentStatuses, fetchRequiredConsentCheck, submitConsents } from './api';
import { consentKeys } from './ConsentGate';
import type { ConsentStatus } from './types';

type Props = {
  open: boolean;
};

export default function RequiredConsentModal({ open }: Props) {
  const queryClient = useQueryClient();
  const requiredCheckQuery = useQuery({
    queryKey: consentKeys.required,
    queryFn: fetchRequiredConsentCheck,
    enabled: open,
    retry: false,
  });
  const statusesQuery = useQuery({
    queryKey: consentKeys.statuses,
    queryFn: fetchConsentStatuses,
    enabled: open,
    retry: false,
  });
  const [agreements, setAgreements] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!statusesQuery.data) {
      return;
    }

    const nextAgreements = statusesQuery.data.reduce<Record<string, boolean>>((acc, term) => {
      acc[term.code] = term.agreed;
      return acc;
    }, {});

    setAgreements((current) => {
      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(nextAgreements);

      if (
        currentKeys.length === nextKeys.length
        && nextKeys.every((key) => current[key] === nextAgreements[key])
      ) {
        return current;
      }

      return nextAgreements;
    });
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
  const allChecked = terms.length > 0 && terms.every((term) => agreements[term.code]);
  const allRequiredChecked = requiredTerms.every((term) => agreements[term.code]);

  return (
    <AppModal
      open={open}
      onOpenChange={() => undefined}
      title="필수 동의"
      description="서비스 사용을 위해 약관을 확인하고 동의 여부를 선택해 주세요."
      size="xl"
      className="bg-[#f3f4f6]"
      bodyClassName="bg-[#f3f4f6] px-4 py-4 sm:px-5 sm:py-5"
      footer={
        <div className="flex w-full items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            {allRequiredChecked ? '필수 동의가 완료되었습니다.' : '필수 항목은 모두 동의해야 계속 진행할 수 있습니다.'}
          </span>
          <Button
            className="rounded-xl px-6"
            disabled={!allRequiredChecked || submitMutation.isPending || requiredCheckQuery.isLoading || statusesQuery.isLoading}
            onClick={() => void submitMutation.mutateAsync(terms)}
          >
            {submitMutation.isPending ? '제출 중...' : '동의하고 계속'}
          </Button>
        </div>
      }
    >
      {requiredCheckQuery.isLoading || statusesQuery.isLoading ? (
        <NoticeState
          title="동의 정보를 불러오는 중입니다"
          description="필수 약관 상태를 확인하고 있습니다."
          loading
        />
      ) : requiredCheckQuery.isError || statusesQuery.isError ? (
        <NoticeState
          title="동의 정보를 불러오지 못했습니다"
          description="백엔드와 통신할 수 없거나 동의 조회에 실패했습니다. 새로고침 후 다시 시도해 주세요."
        />
      ) : (
        <div className="rounded-[28px] border border-slate-300 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <div className="text-[15px] font-semibold text-blue-700">
            1단계 <span className="text-slate-500">/ {Math.max(terms.length, 1)}단계</span>
          </div>
          <h2 className="mt-5 text-[44px] font-semibold tracking-tight text-slate-900">개인정보 활용동의</h2>

          <section className="mt-12">
            <h3 className="text-[28px] font-semibold tracking-tight text-slate-900">약관동의</h3>

            <div className="mt-7 rounded-[24px] bg-slate-100 px-8 py-7">
              <label className="flex cursor-pointer items-start gap-4">
                <input
                  type="checkbox"
                  className="mt-1 h-7 w-7 rounded-md border-slate-300 accent-blue-600"
                  checked={allChecked}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setAgreements(
                      terms.reduce<Record<string, boolean>>((acc, term) => {
                        acc[term.code] = checked;
                        return acc;
                      }, {}),
                    );
                  }}
                />
                <div className="min-w-0">
                  <div className="text-[20px] font-semibold text-slate-900">모두 동의합니다.</div>
                  <p className="mt-6 text-[16px] leading-8 text-slate-700">
                    민간정보 수집이용, 개인정보의 수집 및 이용, 온라인신청 서비스 정책, 고유식별정보 수집 및 이용 항목에 대해 모두 동의합니다. 각 사항에 대한
                    동의 여부를 개별적으로 선택하실 수 있으며, 선택 동의 사항에 대한 동의를 거부하여도 서비스를 이용하실 수 있습니다.
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-8 space-y-8">
              {terms.map((term, index) => {
                const agreed = agreements[term.code] ?? false;

                return (
                  <section key={term.code} className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-[24px] font-semibold text-white">
                        {index + 1}
                      </div>
                      <div className="text-[24px] font-semibold tracking-tight text-slate-900">
                        {term.isRequired ? '[필수] ' : '[선택] '}
                        {term.title}
                      </div>
                    </div>

                    <div className="rounded-[24px] border border-slate-300 bg-white px-8 py-8">
                      <div className="text-[18px] font-semibold text-slate-900">{term.title}</div>
                      <div className="mt-7 space-y-5 text-[16px] leading-8 text-slate-700">
                        <p>
                          1. 수집 및 이용 항목: 서비스 이용 과정에서 필요한 최소한의 정보와 {term.title} 처리에 필요한 데이터를 수집 및 이용합니다.
                        </p>
                        <p>
                          2. 보유 및 이용기간: 관계 법령과 내부 운영 정책에 따라 필요한 기간 동안 정보를 보관하며, 목적 달성 후 또는 보존기간 경과 후 지체 없이
                          파기합니다.
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                          <li>문서 코드: {term.code}</li>
                          <li>문서 유형: {term.type}</li>
                          <li>적용 버전: v{term.version}</li>
                        </ul>
                        <p>{term.description}</p>
                        <p>
                          사용자는 위 안내 사항을 읽고 동의 여부를 선택할 권리가 있으며, 필수 항목을 거부할 경우 해당 서비스 이용이 제한될 수 있습니다.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[20px] bg-slate-100 px-8 py-6">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <p className="text-[16px] leading-7 text-slate-800">{term.title} 안내 사항을 읽고 동의 여부를 선택해 주세요.</p>
                        <div className="w-full lg:w-[260px]">
                          <div className="mb-2 text-[13px] font-medium tracking-[0.04em] text-slate-500">동의 상태</div>
                          <Select
                            value={agreed ? 'agree' : 'disagree'}
                            onValueChange={(value) =>
                              setAgreements((prev) => ({
                                ...prev,
                                [term.code]: value === 'agree',
                              }))
                            }
                          >
                            <SelectTrigger className="h-12 w-full rounded-2xl border-slate-300 bg-white px-4 text-[16px] font-medium text-slate-900 shadow-none">
                              <SelectValue placeholder="동의 여부를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="disagree" className="py-2 text-[15px]">
                                동의안함
                              </SelectItem>
                              <SelectItem value="agree" className="py-2 text-[15px]">
                                동의함
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>

            {requiredCheckQuery.data?.missingRequiredConsentCodes.length ? (
              <div className="mt-8 rounded-[18px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900">
                현재 미충족 필수 동의: {requiredCheckQuery.data.missingRequiredConsentCodes.join(', ')}
              </div>
            ) : null}
          </section>
        </div>
      )}
    </AppModal>
  );
}

function NoticeState({
  title,
  description,
  loading = false,
}: {
  title: string;
  description: string;
  loading?: boolean;
}) {
  return (
    <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-slate-300 bg-white px-8 py-10 text-center">
      <div className="max-w-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-700">
          {loading ? <LoaderCircle className="animate-spin" size={28} /> : <AlertTriangle size={28} />}
        </div>
        <h2 className="mt-5 text-[28px] font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-3 text-[15px] leading-7 text-slate-600">{description}</p>
      </div>
    </div>
  );
}
