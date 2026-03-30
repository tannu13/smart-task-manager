import { CreateTaskForm } from "./CreateTaskForm";
import { TaskList } from "./TaskList";

export const TaskWorkspace = () => (
  <section className="space-y-6">
    <CreateTaskForm />
    <TaskList />
  </section>
);
