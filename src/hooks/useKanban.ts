import { useState, useCallback } from 'react';
import { Task, ColumnId } from '@/types/kanban';

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

  return {
    tasks,
    addTask,
    moveTask,
    deleteTask,
    updateTask,
    getTasksByColumn,
  };
}
