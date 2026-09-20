import { useMemo, useState } from "react";
import { Kanban } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { Skeleton } from "../../components/ui/skeleton";
import { KanbanColumn } from "./components/KanbanColumn";
import { AddTaskDialog } from "./components/AddTaskDialog";
import { TaskDetailDialog } from "./components/TaskDetailDialog";
import { RestrictedButton } from "./components/RestrictedButton";
import { useBoardTasks } from "../../hooks/useBoardTasks";
import { useActiveProject } from "../../hooks/useActiveProject";
import { useTeam } from "../../hooks/useTeam";
import { useProject } from "../../context/ProjectContext";
import { useRole, ROLES } from "../../context/RoleContext";
import { createBoardTask } from "../../services/boardService";
import { getTeamMemberById } from "../../data/mockTeam";
import { setTaskStatus } from "../../lib/taskStatus";

const COLUMNS = [
  { status: "not-started", label: "Backlog" },
  { status: "in-progress", label: "In Progress" },
  { status: "review", label: "Review" },
  { status: "done", label: "Done" },
];

// Base-product Kanban Board: the everyday "what's in progress" view over
// the exact same task records Component 3's Schedule feature reads and
// re-optimizes (src/data/mockSchedulePhases.js via src/services/
// boardService.js). Two independent views sharing a data source: this
// feature never imports from src/features/schedule/, and Schedule never
// imports from here.
export function KanbanBoardPage() {
  const { activeProject, activeProjectId } = useActiveProject();
  const { data: rosterFetched } = useTeam(activeProjectId);
  const { extraTeamForProject } = useProject();
  const { role, currentUser } = useRole();
  const isPM = role === ROLES.PM;
  const { data: tasks, setData: setTasks, loading } = useBoardTasks(activeProjectId);
  const [selectedTask, setSelectedTask] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [, bump] = useState(0);

  const team = useMemo(
    () => [...rosterFetched, ...extraTeamForProject(activeProjectId)],
    [rosterFetched, extraTeamForProject, activeProjectId]
  );

  // A Team Member can drag/edit only tasks assigned to themselves; a PM
  // can touch anything. Matched by name (not id) since the same persona
  // gets a different tm-id per project, same pattern TeamPage uses for
  // "is this my own row".
  const canEdit = (task) => {
    if (isPM) return true;
    const assignee = getTeamMemberById(task.assigneeId);
    return assignee?.name === currentUser?.name;
  };

  const columns = COLUMNS.map((col) => ({ ...col, tasks: tasks.filter((t) => t.status === col.status) }));

  const handleDrop = (status, taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    setDraggedTaskId(null);
    if (!task || task.status === status || !canEdit(task)) return;
    setTaskStatus(task, status);
    bump((n) => n + 1);
  };

  const handleCreateTask = async (form) => {
    const newTask = await createBoardTask(activeProjectId, form);
    setTasks((prev) => [...prev, newTask]);
  };

  return (
    <div>
      <PageHeader
        title="Board"
        description={activeProject ? `Everyday task view for ${activeProject.name}.` : "Everyday task view."}
        actions={
          isPM ? (
            <AddTaskDialog team={team} onCreate={handleCreateTask} />
          ) : (
            <RestrictedButton label="Only Project Managers can create tasks" variant="default" size="default">
              Add Task
            </RestrictedButton>
          )
        }
      />

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {COLUMNS.map((c) => (
            <Skeleton key={c.status} className="h-96 w-72 shrink-0 rounded-xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={Kanban}
          title="No tasks yet"
          description={isPM ? "Add a task to get this board going." : "No tasks have been created for this project yet."}
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {columns.map((col) => (
            <KanbanColumn
              key={col.status}
              status={col.status}
              label={col.label}
              tasks={col.tasks}
              draggedTaskId={draggedTaskId}
              canDrag={canEdit}
              onSelectTask={setSelectedTask}
              onDrop={handleDrop}
              onDragStart={setDraggedTaskId}
              onDragEnd={() => setDraggedTaskId(null)}
            />
          ))}
        </div>
      )}

      <TaskDetailDialog
        task={selectedTask}
        projectId={activeProjectId}
        canEdit={selectedTask ? canEdit(selectedTask) : false}
        open={Boolean(selectedTask)}
        onOpenChange={(o) => !o && setSelectedTask(null)}
        onChanged={() => bump((n) => n + 1)}
      />
    </div>
  );
}
