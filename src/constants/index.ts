import type { Option } from '../types';

export const USERS: Option[] = [
  { id: 'u1', label: '김철수' },
  { id: 'u2', label: '이영희' },
  { id: 'u3', label: '박민수' },
  { id: 'u4', label: '정지원' },
];

export const TASKS: Option[] = [
  { id: 't1', label: '주간 보고서 작성' },
  { id: 't2', label: '디자인 시안 검토' },
  { id: 't3', label: '고객사 미팅' },
  { id: 't4', label: '신규 기능 개발' },
  { id: 't5', label: '마케팅 캠페인 기획' },
];

export const STATUS_STYLES: Record<string, string> = {
  done: 'bg-[#00c875] text-white',
  working: 'bg-[#fdab3d] text-white',
  stuck: 'bg-[#e2445c] text-white',
  empty: 'bg-[#c4c4c4] text-white',
};

export const STATUS_LABELS: Record<string, string> = {
  done: 'Done',
  working: 'Working on it',
  stuck: 'Stuck',
  empty: '',
};

export const GROUP_COLORS: Record<string, string> = {
  red: '#e2445c',
  purple: '#a25ddc',
  blue: '#579bfc',
  green: '#00c875',
};