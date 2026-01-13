import { forwardRef, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types/kanban';
import { Trash2, Check, X, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: { title?: string; description?: string }) => void;
  isDragging?: boolean;
}

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, onDelete, onUpdate, isDragging: externalDragging }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(task.title);
    const [editDescription, setEditDescription] = useState(task.description || '');

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

    const handleSave = () => {
      if (editTitle.trim()) {
        onUpdate(task.id, { 
          title: editTitle.trim(), 
          description: editDescription.trim() || undefined 
        });
        setIsEditing(false);
      }
    };

    const handleCancel = () => {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    };

    if (isEditing) {
      return (
        <div
          ref={setNodeRef}
          style={style}
          className="kanban-card animate-fade-in"
        >
          <div className="space-y-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-background border border-border rounded px-2 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Task title"
              autoFocus
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-background border border-border rounded px-2 py-1 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Description (optional)"
              rows={2}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={handleSave}
                className="p-1 text-primary hover:text-primary/80 transition-colors"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          'kanban-card group animate-fade-in touch-none',
          dragging && 'kanban-card-dragging'
        )}
      >
        <div className="flex items-start gap-3">
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

          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

TaskCard.displayName = 'TaskCard';
