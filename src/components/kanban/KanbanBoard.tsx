import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { useState, useCallback } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { useKanban } from '@/hooks/useKanban';
import { Task, ColumnId, Column } from '@/types/kanban';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const columns: Column[] = [
  { id: 'todo', title: 'To Do', color: 'column-todo' },
  { id: 'in-progress', title: 'In Progress', color: 'column-progress' },
  { id: 'done', title: 'Done', color: 'column-done' },
];

const priorityColors: Record<string, string> = {
  low: 'bg-column-done/20 text-column-done',
  medium: 'bg-column-todo/20 text-column-todo',
  high: 'bg-destructive/20 text-destructive',
};

export function KanbanBoard() {
  const { tasks, addTask, moveTask, deleteTask, getTasksByColumn } = useKanban();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(pointerSensor, touchSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  }, [tasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const activeTaskData = tasks.find((t) => t.id === activeTaskId);
    if (!activeTaskData) return;

    // Check if dropped on a column
    if (columns.some((col) => col.id === overId)) {
      if (activeTaskData.columnId !== overId) {
        moveTask(activeTaskId, overId as ColumnId);
      }
      return;
    }

    // Check if dropped on another task
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && activeTaskData.columnId !== overTask.columnId) {
      moveTask(activeTaskId, overTask.columnId);
    }
  }, [tasks, moveTask]);

  const handleDragEnd = useCallback(() => {
    setActiveTask(null);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={getTasksByColumn(column.id)}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="kanban-card kanban-card-dragging">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-muted-foreground/50">
                <GripVertical className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-card-foreground leading-tight">
                  {activeTask.title}
                </h3>
                {activeTask.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {activeTask.description}
                  </p>
                )}
                {activeTask.priority && (
                  <span
                    className={cn(
                      'inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-2',
                      priorityColors[activeTask.priority]
                    )}
                  >
                    {activeTask.priority}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
