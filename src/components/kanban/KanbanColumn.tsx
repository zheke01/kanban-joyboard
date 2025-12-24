import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, ColumnId } from '@/types/kanban';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: ColumnId;
  title: string;
  tasks: Task[];
  onAddTask: (title: string, columnId: ColumnId) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: { title?: string; description?: string }) => void;
}

export function KanbanColumn({
  id,
  title,
  tasks,
  onAddTask,
  onDeleteTask,
  onUpdateTask,
}: KanbanColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const { setNodeRef, isOver } = useDroppable({ id });

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim(), id);
      setNewTaskTitle('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTaskTitle('');
    }
  };

  const badgeClass = {
    'todo': 'column-badge-todo',
    'in-progress': 'column-badge-progress',
    'done': 'column-badge-done',
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'kanban-column transition-colors duration-200',
        isOver && 'bg-primary/5 ring-2 ring-primary/20'
      )}
    >
      <div className="column-header">
        <div className={cn('column-badge', badgeClass[id])} />
        <h2 className="font-semibold text-foreground">{title}</h2>
        <span className="ml-auto text-sm text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3 flex-1">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={onDeleteTask} onUpdate={onUpdateTask} />
          ))}
        </div>
      </SortableContext>

      {isAdding ? (
        <div className="mt-3 animate-scale-in">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newTaskTitle.trim()) {
                setIsAdding(false);
              }
            }}
            placeholder="Task title..."
            className="w-full px-3 py-2 rounded-lg border border-input bg-card text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddTask}
              className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Add Task
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewTaskTitle('');
              }}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="add-task-btn"
        >
          <Plus className="h-4 w-4" />
          Add task
        </button>
      )}
    </div>
  );
}
