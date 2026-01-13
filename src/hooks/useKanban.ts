import { useState, useCallback } from 'react';
import { Task, ColumnId, Column, ColumnColor } from '@/types/kanban';

const initialColumns: Column[] = [
  { id: 'todo', title: 'To Do', color: '#EAB308' },
  { id: 'in-progress', title: 'In Progress', color: '#3B82F6' },
  { id: 'done', title: 'Done', color: '#22C55E' },
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
  const addColumn = useCallback((title: string, color: ColumnColor = '#3B82F6') => {
    const id = crypto.randomUUID() as ColumnId;
    const newColumn: Column = {
      id,
      title,
      color,
    };
    setColumns((prev) => [...prev, newColumn]);
  }, []);

  const updateColumn = useCallback((columnId: ColumnId, updates: Partial<Pick<Column, 'title' | 'color'>>) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, ...updates } : col
      )
    );
  }, []);

  const deleteColumn = useCallback((columnId: ColumnId) => {
    setColumns((prev) => prev.filter((col) => col.id !== columnId));
    // Also delete all tasks in this column
    setTasks((prev) => prev.filter((task) => task.columnId !== columnId));
  }, []);

  const reorderColumns = useCallback((activeId: string, overId: string) => {
    setColumns((prev) => {
      const oldIndex = prev.findIndex((col) => col.id === activeId);
      const newIndex = prev.findIndex((col) => col.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      const newColumns = [...prev];
      const [movedColumn] = newColumns.splice(oldIndex, 1);
      newColumns.splice(newIndex, 0, movedColumn);
      
      return newColumns;
    });
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
    reorderColumns,
  };
}
