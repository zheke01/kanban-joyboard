import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { useKanban } from '@/hooks/useKanban';
import { Task, ColumnId, Column } from '@/types/kanban';

const columns: Column[] = [
  { id: 'todo', title: 'To Do', color: 'column-todo' },
  { id: 'in-progress', title: 'In Progress', color: 'column-progress' },
  { id: 'done', title: 'Done', color: 'column-done' },
];

export function KanbanBoard() {
  const { tasks, addTask, moveTask, deleteTask, getTasksByColumn } = useKanban();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    if (columns.some((col) => col.id === overId)) {
      moveTask(activeTaskId, overId as ColumnId);
      return;
    }

    // Check if dropped on another task
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask) {
      moveTask(activeTaskId, overTask.columnId);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
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
          <div className="kanban-card-dragging">
            <TaskCard task={activeTask} onDelete={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
