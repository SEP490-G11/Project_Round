export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface UserBrief {
  id: number;
  email: string;
  fullName: string;
}

export interface TaskSummary {
  id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  tags: string[];
  assignee?: UserBrief;
}
