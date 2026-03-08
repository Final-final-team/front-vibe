export type StatusColor = 'done' | 'working' | 'stuck' | 'empty';
export type GroupColor = 'red' | 'purple' | 'blue' | 'green';
export type Option = { id: string; label: string };

export interface SubItemIndicator {
  count: number;
  hasUpdates: boolean;
}

export interface ItemRow {
  id: string;
  name: string;
  subItem?: SubItemIndicator;
  person: 'filled' | 'empty';
  status: StatusColor;
  date: string;
  who?: string;
  where?: string;
  how?: string;
  why?: string;
}

export interface GroupData {
  id: string;
  title: string;
  color: GroupColor;
  items: ItemRow[];
}