export const REVIEW_PERMISSIONS = [
  'REVIEW_SUBMIT',
  'REVIEW_UPDATE',
  'REVIEW_APPROVE',
  'REVIEW_REJECT',
  'REVIEW_CANCEL',
  'REVIEW_REFERENCE_MANAGE',
  'REVIEW_ATTACHMENT_MANAGE',
  'REVIEW_ADDITIONAL_REVIEWER_MANAGE',
  'REVIEW_COMMENT_CREATE',
  'REVIEW_COMMENT_UPDATE',
  'REVIEW_COMMENT_DELETE',
] as const;

export type ReviewPermission = (typeof REVIEW_PERMISSIONS)[number];

export type CurrentActor = {
  actorId: number;
  name: string;
  permissions: ReviewPermission[];
  roles: string[];
};

function readStorage(key: string) {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(key);
}

export function getCurrentActor(): CurrentActor {
  const actorId = Number(readStorage('wm_actor_id') ?? '101');
  const name = readStorage('wm_actor_name') ?? '리뷰 작성자';
  const roles = (readStorage('wm_actor_roles') ?? 'AUTHOR,REVIEWER')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const permissions = (readStorage('wm_actor_permissions') ?? REVIEW_PERMISSIONS.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter((value): value is ReviewPermission =>
      REVIEW_PERMISSIONS.includes(value as ReviewPermission),
    );

  return {
    actorId: Number.isInteger(actorId) && actorId > 0 ? actorId : 101,
    name,
    roles,
    permissions,
  };
}

export function getAccessToken() {
  return readStorage('wm_access_token');
}
