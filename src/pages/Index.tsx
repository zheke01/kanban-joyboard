import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { LayoutDashboard } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Kanban Board</h1>
              <p className="text-sm text-muted-foreground">Organize your tasks with ease</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <KanbanBoard />
      </main>
    </div>
  );
};

export default Index;
