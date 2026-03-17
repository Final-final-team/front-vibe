export type ProjectOnboardingDraft = {
  projectName: string;
  projectSummary: string;
  completedAt: string;
};

const PROJECT_ONBOARDING_KEY = 'wm_project_onboarding';

function readStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(PROJECT_ONBOARDING_KEY);
}

function writeStorage(value: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(PROJECT_ONBOARDING_KEY, value);
}

export function getProjectOnboardingDraft() {
  const raw = readStorage();

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ProjectOnboardingDraft>;

    if (
      typeof parsed.projectName === 'string' &&
      parsed.projectName.trim() &&
      typeof parsed.projectSummary === 'string' &&
      typeof parsed.completedAt === 'string'
    ) {
      return {
        projectName: parsed.projectName,
        projectSummary: parsed.projectSummary,
        completedAt: parsed.completedAt,
      } satisfies ProjectOnboardingDraft;
    }
  } catch {
    return null;
  }

  return null;
}

export function hasCompletedProjectOnboarding() {
  return Boolean(getProjectOnboardingDraft());
}

export function completeProjectOnboarding(input: {
  projectName: string;
  projectSummary: string;
}) {
  writeStorage(
    JSON.stringify({
      projectName: input.projectName.trim(),
      projectSummary: input.projectSummary.trim(),
      completedAt: new Date().toISOString(),
    } satisfies ProjectOnboardingDraft),
  );
}
