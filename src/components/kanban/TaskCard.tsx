import { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/kanban';
import { GripVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, onDelete, isDragging: externalDragging }, ref) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id, data: { task } });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const priorityColors = {
      low: 'bg-column-done/20 text-column-done',
      medium: 'bg-column-todo/20 text-column-todo',
      high: 'bg-destructive/20 text-destructive',
    };

    const dragging = isDragging || externalDragging;

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'kanban-card group animate-fade-in',
          dragging && 'kanban-card-dragging'
        )}
      >
        <div className="flex items-start gap-3">
          <button
            {...attributes}
            {...listeners}
            className="mt-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-card-foreground leading-tight">
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            {task.priority && (
              <span
                className={cn(
                  'inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-2',
                  priorityColors[task.priority]
                )}
              >
                {task.priority}
              </span>
            )}
          </div>

          <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }
);

TaskCard.displayName = 'TaskCard';
