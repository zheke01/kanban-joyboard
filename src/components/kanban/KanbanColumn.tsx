import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, ColumnId, ColumnColor, COLUMN_COLORS } from '@/types/kanban';
import { TaskCard } from './TaskCard';
import { ColorPicker } from './ColorPicker';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: ColumnId;
  title: string;
  color: ColumnColor;
  tasks: Task[];
  onAddTask: (title: string, columnId: ColumnId) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: { title?: string; description?: string }) => void;
  onUpdateColumn: (columnId: ColumnId, updates: { title?: string; color?: ColumnColor }) => void;
  onDeleteColumn: (columnId: ColumnId) => void;
}

export function KanbanColumn({
  id,
  title,
  color,
  tasks,
  onAddTask,
  onDeleteTask,
  onUpdateTask,
  onUpdateColumn,
  onDeleteColumn,
}: KanbanColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

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

  const handleSaveTitle = () => {
    if (editedTitle.trim()) {
      onUpdateColumn(id, { title: editedTitle.trim() });
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditedTitle(title);
      setIsEditingTitle(false);
    }
  };

  const handleColorChange = (newColor: ColumnColor) => {
    onUpdateColumn(id, { color: newColor });
  };

  const colorData = COLUMN_COLORS.find((c) => c.value === color) || COLUMN_COLORS[0];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'kanban-column transition-colors duration-200',
        isOver && 'bg-primary/5 ring-2 ring-primary/20'
      )}
    >
      <div className="column-header group">
        <div
          className="column-badge"
          style={{ backgroundColor: `hsl(${colorData.hsl})` }}
        />
        
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleTitleKeyDown}
              className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
            <button
              onClick={() => { setEditedTitle(title); setIsEditingTitle(false); }}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={handleSaveTitle}
              className="p-1 text-primary hover:text-primary/80"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-semibold text-foreground">{title}</h2>
            <div className="ml-auto flex items-center gap-1">
              <span className="text-sm text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full">
                {tasks.length}
              </span>
              <ColorPicker
                value={color}
                onChange={handleColorChange}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <button
                onClick={() => setIsEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-primary transition-all"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDeleteColumn(id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        )}
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
