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
import { Task, ColumnId } from '@/types/kanban';
import { GripVertical, Plus, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const priorityColors: Record<string, string> = {
  low: 'bg-column-done/20 text-column-done',
  medium: 'bg-column-todo/20 text-column-todo',
  high: 'bg-destructive/20 text-destructive',
};

export function KanbanBoard() {
  const { tasks, columns, addTask, moveTask, deleteTask, updateTask, getTasksByColumn, addColumn, updateColumn, deleteColumn } = useKanban();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

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
  }, [tasks, columns, moveTask]);

  const handleDragEnd = useCallback(() => {
    setActiveTask(null);
  }, []);

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle.trim());
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const handleColumnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddColumn();
    } else if (e.key === 'Escape') {
      setIsAddingColumn(false);
      setNewColumnTitle('');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="min-w-[320px] flex-shrink-0">
            <KanbanColumn
              id={column.id}
              title={column.title}
              tasks={getTasksByColumn(column.id)}
              onAddTask={addTask}
              onDeleteTask={deleteTask}
              onUpdateTask={updateTask}
              onUpdateColumn={updateColumn}
              onDeleteColumn={deleteColumn}
            />
          </div>
        ))}

        {/* Add Column Button */}
        {isAddingColumn ? (
          <div className="min-w-[320px] flex-shrink-0 kanban-column animate-scale-in">
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={handleColumnKeyDown}
              placeholder="Column title..."
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAddColumn}
                className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="h-4 w-4" />
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingColumn(false);
                  setNewColumnTitle('');
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingColumn(true)}
            className="min-w-[320px] flex-shrink-0 h-fit p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary"
          >
            <Plus className="h-5 w-5" />
            Add Column
          </button>
        )}
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
