export type ColumnId = string;

export type ColumnColor = 'yellow' | 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'pink' | 'cyan';

export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: ColumnId;
  createdAt: Date;
  priority?: 'low' | 'medium' | 'high';
}

export interface Column {
  id: ColumnId;
  title: string;
  color: ColumnColor;
}

export const COLUMN_COLORS: { value: ColumnColor; label: string; hsl: string }[] = [
  { value: 'yellow', label: 'Yellow', hsl: '45 93% 47%' },
  { value: 'blue', label: 'Blue', hsl: '221 83% 53%' },
  { value: 'green', label: 'Green', hsl: '142 71% 45%' },
  { value: 'red', label: 'Red', hsl: '0 84% 60%' },
  { value: 'purple', label: 'Purple', hsl: '262 83% 58%' },
  { value: 'orange', label: 'Orange', hsl: '25 95% 53%' },
  { value: 'pink', label: 'Pink', hsl: '330 81% 60%' },
  { value: 'cyan', label: 'Cyan', hsl: '189 94% 43%' },
];
