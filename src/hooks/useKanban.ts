import { useState, useCallback } from 'react';
import { Task, ColumnId, Column } from '@/types/kanban';

const initialColumns: Column[] = [
  { id: 'todo', title: 'To Do', color: 'column-todo' },
  { id: 'in-progress', title: 'In Progress', color: 'column-progress' },
  { id: 'done', title: 'Done', color: 'column-done' },
];

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Design system updates',
    description: 'Update color palette and typography',
    columnId: 'todo',
    createdAt: new Date(),
    priority: 'high',
  },
  {
    id: '2',
    title: 'User authentication flow',
    description: 'Implement login and registration',
    columnId: 'todo',
    createdAt: new Date(),
    priority: 'medium',
  },
  {
    id: '3',
    title: 'API integration',
    description: 'Connect to backend services',
    columnId: 'in-progress',
    createdAt: new Date(),
    priority: 'high',
  },
  {
    id: '4',
    title: 'Dashboard layout',
    description: 'Create responsive grid layout',
    columnId: 'in-progress',
    createdAt: new Date(),
    priority: 'low',
  },
  {
    id: '5',
    title: 'Project setup',
    description: 'Initial repository configuration',
    columnId: 'done',
    createdAt: new Date(),
    priority: 'medium',
  },
];

export function useKanban() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  const addTask = useCallback((title: string, columnId: ColumnId) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      columnId,
      createdAt: new Date(),
    };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const moveTask = useCallback((taskId: string, newColumnId: ColumnId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, columnId: newColumnId } : task
      )
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Pick<Task, 'title' | 'description'>>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  }, []);

  const getTasksByColumn = useCallback(
    (columnId: ColumnId) => tasks.filter((task) => task.columnId === columnId),
    [tasks]
  );

  // Column management
  const addColumn = useCallback((title: string) => {
    const id = crypto.randomUUID() as ColumnId;
    const colors = ['column-todo', 'column-progress', 'column-done'];
    const newColumn: Column = {
      id,
      title,
      color: colors[columns.length % colors.length],
    };
    setColumns((prev) => [...prev, newColumn]);
  }, [columns.length]);

  const updateColumn = useCallback((columnId: ColumnId, title: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, title } : col
      )
    );
  }, []);

  const deleteColumn = useCallback((columnId: ColumnId) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
    // Also delete all tasks in this column
    setTasks((prev) => prev.filter((task) => task.columnId !== columnId));
  }, []);

  return {
    tasks,
    columns,
    addTask,
    moveTask,
    deleteTask,
    updateTask,
    getTasksByColumn,
    addColumn,
    updateColumn,
    deleteColumn,
  };
}
