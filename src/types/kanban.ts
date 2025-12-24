export type ColumnId = 'todo' | 'in-progress' | 'done';

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
  color: string;
}
